# Blog Content Enrichment Plan (Based on Current Repository)

Date: 2026-02-11
Scope: `E:/website` (`apps/website` + `content/blog`)

## 1) Repository Reality Check

| Location | What exists now | What to unlock next | Priority |
|---|---|---|---|
| `content/blog/` | 2 published MDX posts | Expand to 12-16 posts for a real reading surface | P0 |
| `apps/website/lib/blog.ts` | Rich frontmatter model (`status`, `type`, `category`, `seo`, `relatedPosts`) | Use these fields consistently in each post | P0 |
| `apps/website/app/blog/page.tsx` | Blog list, summary, tags, reading time | Add stronger discovery patterns (series/featured/latest) | P1 |
| `apps/website/app/blog/[slug]/page.tsx` | MDX detail page + metadata + cover + tags | Add related posts and end-of-post CTA | P1 |
| `apps/website/components/mdx-components.tsx` | Callout/CodeBlock/Image/Link primitives | Standardize article blocks for better reading quality | P0 |
| `apps/website/app/labs/timestamp-tool.tsx` | Practical feature with enough implementation details | Turn into 2-3 engineering posts | P0 |
| `apps/website/app/tracker/page.tsx` | Full rule system (rewards, anti-abuse, progression) | Turn into product/system design series | P0 |
| `docs/dashboard/PLAN.md` | Clear future roadmap | Publish roadmap / architecture evolution posts | P1 |

---

## 2) Four Content Pillars

| Pillar | Audience | Suggested ratio | Source material in this repo | Outcome |
|---|---|---:|---|---|
| Engineering Practice | Frontend developers | 35% | `app/*`, `lib/blog.ts`, `mdx-components` | Trust and technical authority |
| Product/System Design | PMs, indie builders | 25% | `app/tracker/page.tsx` | Differentiation and discussion |
| Tooling / Labs | Utility-focused readers | 20% | `app/labs/timestamp-tool.tsx` | Practical value and conversion |
| Roadmap & Retrospective | Peers/collaborators | 20% | `README.md`, `docs/dashboard/PLAN.md` | Long-term project confidence |

---

## 3) Suggested 12-Post Backlog

| Batch | Proposed title | `type` | `category` | Suggested tags |
|---|---|---|---|---|
| Batch 1 | Why this site uses Home / Blog / Labs / Tracker as IA | article | architecture | nextjs, ia, personal-site |
| Batch 1 | Designing a blog content model with frontmatter and state transitions | tutorial | engineering | mdx, frontmatter, cms-lite |
| Batch 1 | Tracker rule modeling: rewards, penalties, anti-abuse | article | product | gamification, anti-cheat |
| Batch 1 | Building a timestamp tool: timezone, precision, UX tradeoffs | tutorial | labs | timestamp, utc, ux |
| Batch 2 | Reusable MDX components in production (callout/code/image/link) | tutorial | engineering | mdx, components |
| Batch 2 | Blog SEO baseline in Next.js: title/summary/OG/noindex | tutorial | seo | seo, nextjs |
| Batch 2 | Designing streak incentives from 0 to 1 | article | product | growth, retention |
| Batch 2 | Dark mode readability: token-level and component-level fixes | note | design | dark-mode, accessibility |
| Batch 3 | Monorepo evolution: website first, dashboard next | article | architecture | monorepo, roadmap |
| Batch 3 | Better discoverability: tags, categories, search, pagination | tutorial | content | taxonomy, search |
| Batch 3 | How to write maintainable technical posts | note | writing | writing, workflow |
| Batch 3 | What will be built next: a public roadmap post | announcement | roadmap | roadmap, planning |

---

## 4) 6-Week Publishing Cadence

| Week | Output | Goal | Notes |
|---|---|---|---|
| Week 1 | 2 posts (engineering + product) | Define your voice and scope | Start from already-built features |
| Week 2 | 2 posts (labs + engineering) | Increase practical value | Link to `/labs` and `/blog` actively |
| Week 3 | 2 posts (product + retrospective) | Add depth and judgment | Start internal cross-linking |
| Week 4 | 2 posts (seo + writing workflow) | Improve distribution quality | Standardize metadata quality |
| Week 5 | 2 posts (architecture + product) | Show long-term direction | Connect to dashboard planning |
| Week 6 | 2 posts (roadmap + summary) | Build a complete reading path | New readers can follow end-to-end |

---

## 5) Post Template Standard

| Section | Suggested length | Must include | Component hint |
|---|---:|---|---|
| Context and problem | 150-250 words | Why this problem matters | paragraph + callout |
| Options and tradeoffs | 300-500 words | 2-3 options + decision reason | heading + list |
| Implementation core | 300-700 words | key code/config | code block |
| Edge cases / failures | 150-300 words | anti-patterns + pitfalls | warning callout |
| Conclusion + next step | 80-150 words | clear next action + links | inline links |

---

## 6) Frontmatter Baseline (Aligned with `lib/blog.ts`)

```yaml
---
title: "Post title"
slug: "post-slug"
date: "2026-02-11"
updatedAt: "2026-02-11"
summary: "One-sentence value statement"
cover:
  src: "/og.png"
  alt: "Cover alt text"
author: "Yuri"
tags: ["nextjs", "mdx"]
category: "engineering"
status: "published"
type: "tutorial"
relatedPosts: ["another-post-slug"]
seo:
  description: "SEO description"
  keywords: ["nextjs", "blog"]
comments:
  enabled: false
---
```

---

## 7) Immediate Action List for This Repo

| Action | Where | Done when | Priority |
|---|---|---|---|
| Fill `category/type/relatedPosts` in existing posts | `content/blog/*.mdx` | Existing posts become metadata-complete | P0 |
| Add 4 new posts from already-built features | `content/blog/` | Total reaches 6 posts | P0 |
| Add end-of-post "Read Next" block manually | each MDX post | Better internal navigation | P1 |
| Maintain 2 posts per week for 6 weeks | content workflow | Stable publishing momentum | P0 |
| Implement tags/categories index pages later | `app/blog/*` | Better discoverability | P1 |

---

## 8) Start-Now Top 3

| Order | Title | Difficulty | Est. effort |
|---|---|---|---:|
| 1 | Blog content model: frontmatter + state machine | Low | 1.5h |
| 2 | Tracker rules: incentives, penalties, anti-abuse | Medium | 2h |
| 3 | Timestamp tool implementation retrospective | Medium | 2h |

Recommendation: start with features that already exist in this codebase, then extend into roadmap and system-level writing.
