export const DEVELOPER_TOOL_MAX_INPUT = 100_000;
export const DEVELOPER_TOOL_MAX_OUTPUT = 200_000;
export const DEVELOPER_TOOL_MAX_JSON_DEPTH = 128;

function assertBoundedInput(value: string) {
  if (value.length > DEVELOPER_TOOL_MAX_INPUT) {
    throw new Error("input_too_large");
  }
}

function parseBoundedJson(value: string) {
  assertBoundedInput(value);
  const parsed = JSON.parse(value) as unknown;
  const stack: Array<{ value: unknown; depth: number }> = [{ value: parsed, depth: 1 }];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current.value !== "object" || current.value === null) continue;
    if (current.depth > DEVELOPER_TOOL_MAX_JSON_DEPTH) {
      throw new Error("json_too_deep");
    }
    const children = Array.isArray(current.value)
      ? current.value
      : Object.values(current.value as Record<string, unknown>);
    for (const child of children) stack.push({ value: child, depth: current.depth + 1 });
  }

  return parsed;
}

function assertBoundedOutput(value: string) {
  if (value.length > DEVELOPER_TOOL_MAX_OUTPUT) {
    throw new Error("output_too_large");
  }
  return value;
}

export function formatJson(value: string, indentation = 2) {
  return assertBoundedOutput(JSON.stringify(parseBoundedJson(value), null, indentation));
}

export function minifyJson(value: string) {
  return assertBoundedOutput(JSON.stringify(parseBoundedJson(value)));
}

export function encodeUrlComponent(value: string) {
  assertBoundedInput(value);
  return encodeURIComponent(value);
}

export function decodeUrlComponent(value: string) {
  assertBoundedInput(value);
  return decodeURIComponent(value);
}

export function encodeBase64(value: string) {
  assertBoundedInput(value);
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 8_192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8_192));
  }
  return btoa(binary);
}

export function decodeBase64(value: string) {
  assertBoundedInput(value);
  const normalized = value.replace(/\s+/g, "");
  if (!normalized || normalized.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error("invalid_base64");
  }
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function generateUuid() {
  if (!globalThis.crypto?.randomUUID) throw new Error("crypto_unavailable");
  return globalThis.crypto.randomUUID();
}

export async function sha256Hex(value: string) {
  assertBoundedInput(value);
  if (!globalThis.crypto?.subtle) throw new Error("crypto_unavailable");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function expandHex(value: string) {
  const normalized = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(normalized)) {
    return `#${normalized
      .slice(1)
      .split("")
      .map((character) => `${character}${character}`)
      .join("")}`;
  }
  if (/^#[0-9a-f]{6}$/.test(normalized)) return normalized;
  throw new Error("invalid_color");
}

function relativeLuminance(value: string) {
  const hex = expandHex(value);
  const channels = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((channel) => {
    const srgb = Number.parseInt(channel, 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastChecks(ratio: number) {
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5
  };
}
