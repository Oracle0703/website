const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = process.cwd();
const validatorPath = path.join(root, 'scripts', 'validate-website-content.mjs');

async function loadValidator() {
  const validator = await import(`${pathToFileURL(validatorPath).href}?t=${Date.now()}`);
  return validator;
}

function writePost(dir, fileName, frontmatter, body = '正文内容') {
  const lines = ['---'];
  for (const line of frontmatter) {
    lines.push(line);
  }
  lines.push('---', '', body);
  fs.writeFileSync(path.join(dir, fileName), lines.join('\n'), 'utf8');
}

async function withTempBlogDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'website-content-'));
  try {
    return await fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('content validator rejects published posts with invalid cover alt and references to drafts', async () => {
  await withTempBlogDir(async (dir) => {
    writePost(dir, 'published.mdx', [
      'title: "Published"',
      'slug: "published"',
      'date: "2026-02-11"',
      'updatedAt: "2026-02-11"',
      'summary: "Published summary"',
      'cover:',
      '  src: "/og.png"',
      '  alt: ""',
      'author: "Meaningful Ink"',
      'tags: ["SEO"]',
      'category: "Engineering"',
      'status: "published"',
      'relatedPosts: ["draft-post"]'
    ]);

    writePost(dir, 'draft.mdx', [
      'title: "Draft"',
      'slug: "draft-post"',
      'date: "2026-02-12"',
      'updatedAt: "2026-02-12"',
      'summary: "Draft summary"',
      'cover: "/og.png"',
      'author: "Meaningful Ink"',
      'status: "draft"'
    ]);

    const { validateContentDirectory } = await loadValidator();
    const result = validateContentDirectory(dir);

    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /published.*cover alt is required/);
    assert.match(result.errors.join('\n'), /published.*relatedPosts.*draft-post.*draft/);
  });
});

test('content validator rejects duplicate published series order', async () => {
  await withTempBlogDir(async (dir) => {
    for (const slug of ['first', 'second']) {
      writePost(dir, `${slug}.mdx`, [
        `title: "${slug}"`,
        `slug: "${slug}"`,
        'date: "2026-02-11"',
        'updatedAt: "2026-02-11"',
        `summary: "${slug} summary"`,
        'cover:',
        '  src: "/og.png"',
        `  alt: "${slug} cover"`,
        'author: "Meaningful Ink"',
        'tags: ["SEO"]',
        'category: "Engineering"',
        'status: "published"',
        'series:',
        '  id: "website-engineering"',
        '  title: "Website Engineering"',
        '  order: 1'
      ]);
    }

    const { validateContentDirectory } = await loadValidator();
    const result = validateContentDirectory(dir);

    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /website-engineering.*duplicate series order 1/);
  });
});

test('content validator rejects published mdx images without alt text', async () => {
  await withTempBlogDir(async (dir) => {
    writePost(
      dir,
      'missing-mdx-alt.mdx',
      [
        'title: "Missing MDX Alt"',
        'slug: "missing-mdx-alt"',
        'date: "2026-02-11"',
        'updatedAt: "2026-02-11"',
        'summary: "Missing MDX image alt summary"',
        'cover:',
        '  src: "/og.png"',
        '  alt: "Cover"',
        'author: "Meaningful Ink"',
        'tags: ["SEO"]',
        'category: "Engineering"',
        'status: "published"'
      ],
      '<Image src="/og.png" />'
    );

    const { validateContentDirectory } = await loadValidator();
    const result = validateContentDirectory(dir);

    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /missing-mdx-alt.*mdx image alt is required/);
  });
});

test('content validator accepts current repository content', async () => {
  const { validateContentDirectory } = await loadValidator();
  const result = validateContentDirectory(path.join(root, 'content', 'blog'));

  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
  assert.ok(result.filesChecked > 0);
});
