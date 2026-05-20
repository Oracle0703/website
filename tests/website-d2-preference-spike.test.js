const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8');
}

test('root layout uses default locale and theme without server cookie helpers', () => {
  const source = read('apps/website/app/layout.tsx');

  assert.doesNotMatch(source, /i18n-server/);
  assert.doesNotMatch(source, /theme-server/);
  assert.doesNotMatch(source, /getLocale\(/);
  assert.doesNotMatch(source, /getTheme\(/);
  assert.match(source, /defaultLocale/);
  assert.match(source, /defaultTheme/);
  assert.match(source, /getMessages\(defaultLocale\)/);
  assert.match(source, /getHtmlLang\(defaultLocale\)/);
  assert.match(source, /data-theme=\{defaultTheme\}/);
  assert.match(source, /<PreferenceBootScript \/>/);
  assert.match(source, /initialLocale=\{defaultLocale\}/);
  assert.match(source, /initialTheme=\{defaultTheme\}/);
});

test('preference boot script restores valid cookie or localStorage values before hydration', () => {
  const source = read('apps/website/app/preference-boot-script.tsx');

  assert.match(source, /export function PreferenceBootScript/);
  assert.match(source, /dangerouslySetInnerHTML/);
  assert.match(source, /localStorage\.getItem\("locale"\)/);
  assert.match(source, /localStorage\.getItem\("theme"\)/);
  assert.match(source, /document\.cookie/);
  assert.match(source, /document\.documentElement\.lang/);
  assert.match(source, /document\.documentElement\.dataset\.theme/);
  assert.match(source, /suppressHydrationWarning/);
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
