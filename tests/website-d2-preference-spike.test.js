const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('localized root layouts make the route the server-rendered document language', () => {
  const zhLayout = read('apps/website/app/(zh)/layout.tsx');
  const enLayout = read('apps/website/app/en/layout.tsx');
  const rootDocument = read('apps/website/components/root-document.tsx');
  const rootMetadata = read('apps/website/lib/root-metadata.ts');

  assert.equal(fs.existsSync(path.join(root, 'apps/website/app/layout.tsx')), false);
  assert.match(zhLayout, /import "\.\.\/globals\.css"/);
  assert.match(enLayout, /import "\.\.\/globals\.css"/);
  assert.match(zhLayout, /locale="zh"/);
  assert.match(enLayout, /locale="en"/);
  assert.match(rootDocument, /getHtmlLang\(locale\)/);
  assert.match(rootDocument, /data-theme=\{defaultTheme\}/);
  assert.match(rootDocument, /<PreferenceBootScript \/>/);
  assert.match(rootDocument, /initialLocale=\{locale\}/);
  assert.match(rootDocument, /initialTheme=\{defaultTheme\}/);
  assert.match(rootMetadata, /getMessages\(locale\)/);
  assert.match(rootMetadata, /locale === "en"/);
});

test('preference boot script restores only theme because the route owns document language', () => {
  const source = read('apps/website/app/preference-boot-script.tsx');

  assert.match(source, /export function PreferenceBootScript/);
  assert.match(source, /dangerouslySetInnerHTML/);
  assert.match(source, /localStorage\.getItem\("theme"\)/);
  assert.match(source, /document\.cookie/);
  assert.match(source, /document\.documentElement\.dataset\.theme/);
  assert.match(source, /suppressHydrationWarning/);
  assert.doesNotMatch(source, /localStorage\.getItem\("locale"\)/);
  assert.doesNotMatch(source, /document\.documentElement\.lang/);
  assert.doesNotMatch(source, /location\.pathname/);
});

test('language and theme providers restore preferences on mount without refresh loops', () => {
  const languageSource = read('apps/website/components/language-provider.tsx');
  const themeSource = read('apps/website/components/theme-provider.tsx');

  assert.match(languageSource, /getRouteLocale/);
  assert.match(languageSource, /getLocalePath/);
  assert.match(languageSource, /getAlternateLocalePath/);
  assert.match(languageSource, /localStorage\.setItem\(LOCALE_COOKIE,\s*locale\)/);
  assert.match(languageSource, /setLocale\(routeLocale\)/);
  assert.match(languageSource, /router\.push/);
  assert.doesNotMatch(languageSource, /router\.refresh\(\)/);
  assert.doesNotMatch(languageSource, /document\.documentElement\.lang/);

  assert.match(themeSource, /getStoredTheme/);
  assert.match(themeSource, /localStorage\.setItem\(THEME_COOKIE,\s*theme\)/);
  assert.match(themeSource, /const restoredTheme = getStoredTheme\(\)/);
  assert.match(themeSource, /setTheme\(restoredTheme\)/);
});

test('static rendering document records the D2 minimum preference spike', () => {
  const source = read('docs/website/STATIC_RENDERING_SPIKE.md');

  assert.match(source, /D2 最小偏好恢复 spike/);
  assert.match(source, /PreferenceBootScript/);
  assert.match(source, /localStorage/);
  assert.match(source, /根布局/);
  assert.match(source, /页面级 `getLocale\(\)`/);
});
