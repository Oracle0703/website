const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

async function loadTools() {
  const url = pathToFileURL(path.join(root, "apps/website/lib/developer-tools.ts"));
  return import(`${url.href}?test=${Date.now()}-${Math.random()}`);
}

test("developer toolbox transforms Unicode text and JSON without a backend", async () => {
  const tools = await loadTools();

  assert.equal(tools.formatJson('{"hello":"世界"}'), '{\n  "hello": "世界"\n}');
  assert.equal(tools.minifyJson('{\n "hello": "世界" \n}'), '{"hello":"世界"}');
  assert.equal(tools.decodeBase64(tools.encodeBase64("Meaningful · 墨水")), "Meaningful · 墨水");
  assert.equal(tools.decodeUrlComponent(tools.encodeUrlComponent("a/b? 中文")), "a/b? 中文");
  assert.throws(() => tools.decodeBase64("not base64"), /invalid_base64/);
  assert.throws(
    () => tools.formatJson(`${"{\"value\":".repeat(129)}0${"}".repeat(129)}`),
    /json_too_deep/
  );
  assert.throws(
    () => tools.formatJson(`[${"0,".repeat(44_999)}0]`),
    /output_too_large/
  );
});

test("developer toolbox uses native cryptography and computes WCAG contrast thresholds", async () => {
  const tools = await loadTools();
  const digest = await tools.sha256Hex("abc");
  const ratio = tools.contrastRatio("#000", "#ffffff");

  assert.equal(digest, "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  assert.equal(ratio, 21);
  assert.deepEqual(tools.contrastChecks(ratio), {
    aaNormal: true,
    aaLarge: true,
    aaaNormal: true,
    aaaLarge: true
  });
  assert.match(tools.generateUuid(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});

test("developer toolbox pages keep input local, bounded, bilingual, and canonical", () => {
  const client = read("apps/website/app/labs/tools/developer-tools-client.tsx");
  const moduleSource = read("apps/website/lib/developer-tools.ts");
  const page = read("apps/website/app/labs/tools/developer-tools-page.tsx");
  const zhRoute = read("apps/website/app/(zh)/labs/tools/page.tsx");
  const enRoute = read("apps/website/app/en/labs/tools/page.tsx");

  assert.match(client, /DEVELOPER_TOOL_MAX_INPUT/);
  assert.match(client, /所有输入都只在当前浏览器中处理/);
  assert.match(client, /Every input is processed only in this browser/);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|localStorage|dangerouslySetInnerHTML|\beval\(/);
  assert.match(moduleSource, /DEVELOPER_TOOL_MAX_INPUT = 100_000/);
  assert.match(moduleSource, /DEVELOPER_TOOL_MAX_JSON_DEPTH = 128/);
  assert.match(moduleSource, /DEVELOPER_TOOL_MAX_OUTPUT = 200_000/);
  assert.match(moduleSource, /crypto\.subtle\.digest\("SHA-256"/);
  assert.match(page, /<main/);
  assert.match(zhRoute, /getLanguageAlternates\("\/labs\/tools"\)/);
  assert.match(enRoute, /canonical: toAbsoluteUrl\("\/en\/labs\/tools"\)/);
});
