const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function getCssBlock(source, selector) {
  const start = source.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `${selector} should exist`);
  const end = source.indexOf("\n}", start);
  assert.notEqual(end, -1, `${selector} should have a closing brace`);
  return source.slice(start, end + 2);
}

function parseRgb(block, token) {
  const match = block.match(new RegExp(`--${token}-rgb:\\s*(\\d+) (\\d+) (\\d+);`));
  assert.ok(match, `${token} should be an RGB triplet`);
  return match.slice(1).map(Number);
}

function relativeLuminance([red, green, blue]) {
  const channels = [red, green, blue].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test("Copper Circuit defines the reviewed dark and light theme tokens", () => {
  const source = read("apps/website/app/globals.css");
  const dark = getCssBlock(source, ":root");
  const light = getCssBlock(source, '[data-theme="light"]');

  const expected = [
    [dark, "ui-base", "12 12 15"],
    [dark, "ui-surface", "23 23 28"],
    [dark, "ui-text-primary", "245 242 235"],
    [dark, "ui-text-muted", "170 163 154"],
    [dark, "ui-edge", "104 97 104"],
    [dark, "ui-accent", "231 167 91"],
    [dark, "ui-accent-strong", "245 194 122"],
    [dark, "ui-accent-secondary", "95 212 208"],
    [dark, "ui-on-accent", "12 12 15"],
    [light, "ui-base", "246 241 232"],
    [light, "ui-surface", "255 252 247"],
    [light, "ui-text-primary", "36 32 39"],
    [light, "ui-text-muted", "113 106 101"],
    [light, "ui-edge", "155 144 133"],
    [light, "ui-accent", "154 78 18"],
    [light, "ui-accent-strong", "120 55 11"],
    [light, "ui-accent-secondary", "15 118 110"],
    [light, "ui-on-accent", "255 255 255"]
  ];

  for (const [block, token, value] of expected) {
    assert.match(block, new RegExp(`--${token}-rgb:\\s*${value};`));
  }

  assert.match(source, /--color-accent-secondary:\s*rgb\(var\(--ui-accent-secondary-rgb\)\)/);
  assert.match(source, /--color-on-accent:\s*rgb\(var\(--ui-on-accent-rgb\)\)/);
  assert.match(
    source,
    /@source inline\("bg-accent-secondary text-accent-secondary text-on-accent"\)/
  );
});

test("Copper Circuit text, boundaries, and action foregrounds meet their contrast targets", () => {
  const source = read("apps/website/app/globals.css");

  for (const selector of [":root", '[data-theme="light"]']) {
    const block = getCssBlock(source, selector);
    const base = parseRgb(block, "ui-base");
    const surface = parseRgb(block, "ui-surface");
    const text = parseRgb(block, "ui-text-primary");
    const muted = parseRgb(block, "ui-text-muted");
    const edge = parseRgb(block, "ui-edge");
    const accent = parseRgb(block, "ui-accent");
    const accentStrong = parseRgb(block, "ui-accent-strong");
    const secondaryAccent = parseRgb(block, "ui-accent-secondary");
    const onAccent = parseRgb(block, "ui-on-accent");

    assert.ok(contrast(text, base) >= 4.5, `${selector} primary text should pass AA`);
    assert.ok(contrast(muted, base) >= 4.5, `${selector} muted text should pass AA`);
    assert.ok(contrast(edge, surface) >= 2.95, `${selector} edge should stay near 3:1`);
    assert.ok(contrast(accent, base) >= 4.5, `${selector} accent text should pass AA`);
    assert.ok(
      contrast(secondaryAccent, base) >= 4.5,
      `${selector} secondary accent text should pass AA`
    );
    assert.ok(contrast(onAccent, accent) >= 4.5, `${selector} primary action should pass AA`);
    assert.ok(
      contrast(onAccent, accentStrong) >= 4.5,
      `${selector} primary action hover should pass AA`
    );
  }
});

test("theme surfaces and shadows use semantic Copper Circuit roles", () => {
  const source = read("apps/website/app/globals.css");
  const panelStart = source.indexOf(".panel-surface {");
  const panelEnd = source.indexOf("\n  }", panelStart);
  const panel = source.slice(panelStart, panelEnd + 4);

  assert.match(source, /rgb\(var\(--ui-accent-secondary-rgb\) \/ 0\.08\)/);
  assert.doesNotMatch(source, /shadow-blue/);
  assert.match(panel, /bg-surface/);
  assert.doesNotMatch(panel, /backdrop-blur/);

  for (const className of ["section-plain", "feature-surface", "brand-banner", "list-row"]) {
    assert.match(source, new RegExp(`\\.${className}\\s*\\{`));
  }

  assert.match(source, /\.btn-primary\s*\{[\s\S]*?text-on-accent/);
  assert.match(source, /color:\s*rgb\(var\(--ui-on-accent-rgb\) \/ 1\) !important/);
  assert.doesNotMatch(source, /\.btn-primary\s*\{[^}]*text-white/);
});

test("typography exposes the secondary accent role", () => {
  const source = read("apps/website/lib/typography.ts");

  assert.match(source, /TEXT_SM_SEMIBOLD_ACCENT_SECONDARY/);
  assert.match(source, /EYEBROW_ACCENT_SECONDARY/);
  assert.match(source, /text-accent-secondary/);
});

test("accent-backed interactive surfaces use the semantic foreground token", () => {
  const sources = [
    "apps/website/app/labs/timestamp-tool.tsx",
    "apps/website/app/tracker/tracker-client.tsx",
    "apps/website/components/mdx-components.tsx"
  ].map(read);

  for (const source of sources) {
    assert.doesNotMatch(source, /bg-accent[^"'\n]*text-white/);
    assert.doesNotMatch(source, /hover:bg-accent[^"'\n]*hover:text-white/);
    assert.match(source, /text-on-accent/);
  }
});

test("AI analysis status surfaces keep readable semantic text in both themes", () => {
  const source = read("apps/website/components/landing/ai-page-analysis-landing-client.tsx");

  assert.doesNotMatch(source, /text-red-200|text-emerald-300/);
  assert.match(source, /border-red-500\/40 bg-red-500\/10[^"']*text-primary/);
  assert.match(source, /border-emerald-500\/45 bg-emerald-500\/10 text-primary/);
});
