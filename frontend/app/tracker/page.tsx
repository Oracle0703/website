import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AnnouncementTicker } from "../../components/announcement-ticker";
import { getLocale } from "../../lib/i18n-server";
import { getMessages } from "../../lib/i18n";
import type { Locale } from "../../lib/i18n";

export const generateMetadata = (): Metadata => {
  const locale = getLocale();
  const { seo } = getMessages(locale);

  return {
    title: seo.trackerTitle,
    description: seo.trackerDescription
  };
};

type RewardItem = { label: string; reward: string };
type TrackerTableRow = { level: string; range: string; note: string };

type TrackerContent = {
  panel: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
    note: string;
  };
  stats: { label: string; value: string; helper: string }[];
  progress: {
    title: string;
    currentLabel: string;
    nextLabel: string;
    current: number;
    next: number;
    note: string;
  };
  streakRewards: {
    title: string;
    items: RewardItem[];
  };
  rules: { title: string; items: string[] };
  specialDay: { title: string; items: string[] };
  settlement: { title: string; weeklyLabel: string; monthlyLabel: string; weekly: string[]; monthly: string[] };
  makeup: { title: string; items: string[] };
  realms: { title: string; columns: string[]; rows: TrackerTableRow[] };
  tasks: {
    title: string;
    dailyTitle: string;
    dailyReward: string;
    dailyItems: string[];
    deepTitle: string;
    deepReward: string;
    deepItems: string[];
    note: string;
  };
  merits: { title: string; items: string[] };
  antiCheat: { title: string; items: string[] };
  exchange: { title: string; items: string[] };
  footerNote: string;
  announcements: string[];
};

const trackerContent: Record<Locale, TrackerContent> = {
  zh: {
    panel: {
      eyebrow: "今日修行",
      title: "签到面板",
      description: "完成签到与任务，积累修为值与灵石。",
      button: "今日签到",
      note: "签到后可叠加早课/夜修加成与连续奖励。"
    },
    stats: [
      { label: "当前境界", value: "筑基", helper: "下一层级：金丹" },
      { label: "修为值", value: "680", helper: "距离晋升还差 220" },
      { label: "连续天数", value: "12 天", helper: "距离 14 天奖励还差 2 天" },
      { label: "灵石 / 功德", value: "6 / 3", helper: "灵石可用于补签" }
    ],
    progress: {
      title: "修为进度",
      currentLabel: "筑基",
      nextLabel: "金丹",
      current: 680,
      next: 900,
      note: "每次签到与任务都会推进进度条。"
    },
    streakRewards: {
      title: "连续奖励",
      items: [
        { label: "连续 3 天", reward: "+5 修为值" },
        { label: "连续 7 天", reward: "+20 修为值" },
        { label: "连续 14 天", reward: "+50 修为值" },
        { label: "连续 30 天", reward: "+120 修为值 +2 灵石" },
        { label: "连续 60 天", reward: "+260 修为值 +5 灵石" },
        { label: "连续 100 天", reward: "+500 修为值 +10 灵石" }
      ]
    },
    rules: {
      title: "规则速览",
      items: [
        "每日签到：+10 修为值、+1 灵石",
        "签到时间：00:00–23:59（本地时区）",
        "早课加成：05:00–09:00 额外 +2 修为值",
        "夜修加成：22:00–23:59 额外 +2 修为值",
        "每日仅 1 次有效签到",
        "当日任务额外奖励上限 +15 修为值"
      ]
    },
    specialDay: {
      title: "月度特殊日 · 3 号开坛",
      items: [
        "当日签到额外 +30 修为值、+3 灵石、+1 功德",
        "补签不触发开坛日奖励",
        "可与连续签到奖励叠加"
      ]
    },
    settlement: {
      title: "周/月结算",
      weeklyLabel: "周结算",
      monthlyLabel: "月结算",
      weekly: ["周内签到 ≥ 5 天：+30 修为值", "周内全勤 7 天：+60 修为值 +1 灵石"],
      monthly: [
        "月内签到 ≥ 20 天：+100 修为值",
        "月内签到 ≥ 26 天：+180 修为值 +2 灵石",
        "月内全勤：+300 修为值 +5 灵石 +3 功德"
      ]
    },
    makeup: {
      title: "断签与补签",
      items: [
        "断签连续天数归零，但累计修为值保留",
        "补签消耗 2 灵石，仅能补过去 7 天",
        "补签仅恢复连续奖励，不叠加日常签到",
        "月度补签最多 3 次"
      ]
    },
    realms: {
      title: "境界等级",
      columns: ["境界", "修为值区间", "说明"],
      rows: [
        { level: "炼气", range: "0–299", note: "入门期，建立打卡习惯" },
        { level: "筑基", range: "300–899", note: "形成稳定节奏" },
        { level: "金丹", range: "900–1799", note: "连续签到显著提升" },
        { level: "元婴", range: "1800–2999", note: "具备长期输出能力" },
        { level: "化神", range: "3000–4499", note: "中长期目标形成闭环" },
        { level: "合体", range: "4500–6399", note: "稳态高频打卡" },
        { level: "大乘", range: "6400–8999", note: "长周期持续者" },
        { level: "渡劫", range: "9000–11999", note: "冲刺阶段" },
        { level: "仙人", range: "12000+", note: "打卡长期主义者" }
      ]
    },
    tasks: {
      title: "修炼任务",
      dailyTitle: "日常任务（简单）",
      dailyReward: "每项 +5 修为值（最多 3 项）",
      dailyItems: ["写下今日修炼目标（≥ 1 条）", "专注学习/阅读 10–15 分钟", "整理待办或复盘 3 条要点"],
      deepTitle: "深修任务（高难）",
      deepReward: "完成 +10 修为值 +1 功德",
      deepItems: [
        "连续专注 120 分钟（学习/开发/阅读）",
        "输出一篇学习总结（≥ 800 字）",
        "完成一次高强度训练（≥ 60 分钟）或提交可展示成果"
      ],
      note: "任务奖励需与当日签到绑定，次日失效。"
    },
    merits: {
      title: "功德获取",
      items: ["发布一篇公开心得/教程：+3 功德", "参与社区答疑或提交反馈：+1 功德", "连续 30 天打卡完成后：+2 功德"]
    },
    antiCheat: {
      title: "功德防刷机制",
      items: [
        "贡献需审核或达到质量门槛后计入功德",
        "同日功德上限：每日最多获得 3 功德",
        "同类贡献每周最多计入 3 次，间隔至少 12 小时",
        "重复内容、灌水或批量提交将不计入并触发冷却",
        "冻结条件：当日积分增长超过当天获取总和则判定异常",
        "冻结处理：扣除超出部分积分，并将境界降低一级"
      ]
    },
    exchange: {
      title: "兑换与消耗",
      items: ["灵石可用于补签、抽取功法卡或兑换主题皮肤", "功德值可用于活动报名、置顶展示、社区贡献排行"]
    },
    footerNote: "当前数据为示例，后续可接入真实签到与排行。",
    announcements: [
      "林远晋升至金丹境 · 连续修行 30 日",
      "苏璃触发深修任务 · 完成 120 分钟专注",
      "陆行完成三连签 · 获得灵石奖励",
      "青禾达成周度全勤 · 修为大幅提升",
      "星河提交功法总结 · 获得功德 +1"
    ]
  },
  en: {
    panel: {
      eyebrow: "Daily Practice",
      title: "Check-in Console",
      description: "Complete your check-in and tasks to gain cultivation and spirit stones.",
      button: "Check in today",
      note: "Check-ins stack with morning/night bonuses and streak rewards."
    },
    stats: [
      { label: "Realm", value: "Foundation", helper: "Next: Golden Core" },
      { label: "Cultivation", value: "680", helper: "220 points to rank up" },
      { label: "Streak", value: "12 days", helper: "2 days to the 14-day reward" },
      { label: "Stones / Merit", value: "6 / 3", helper: "Stones can be used for make-up" }
    ],
    progress: {
      title: "Cultivation Progress",
      currentLabel: "Foundation",
      nextLabel: "Golden Core",
      current: 680,
      next: 900,
      note: "Every check-in and task advances the bar."
    },
    streakRewards: {
      title: "Streak Rewards",
      items: [
        { label: "3-day streak", reward: "+5 cultivation" },
        { label: "7-day streak", reward: "+20 cultivation" },
        { label: "14-day streak", reward: "+50 cultivation" },
        { label: "30-day streak", reward: "+120 cultivation +2 stones" },
        { label: "60-day streak", reward: "+260 cultivation +5 stones" },
        { label: "100-day streak", reward: "+500 cultivation +10 stones" }
      ]
    },
    rules: {
      title: "Quick Rules",
      items: [
        "Daily check-in: +10 cultivation, +1 stone",
        "Check-in window: 00:00–23:59 (local time)",
        "Morning bonus: +2 cultivation at 05:00–09:00",
        "Night bonus: +2 cultivation at 22:00–23:59",
        "Only one valid check-in per day",
        "Daily task bonus cap: +15 cultivation"
      ]
    },
    specialDay: {
      title: "Monthly Special Day · 3rd",
      items: [
        "Check-in bonus: +30 cultivation, +3 stones, +1 merit",
        "Make-up check-in does not trigger the bonus",
        "Stacks with streak rewards"
      ]
    },
    settlement: {
      title: "Weekly & Monthly Settlement",
      weeklyLabel: "Weekly",
      monthlyLabel: "Monthly",
      weekly: ["5+ check-ins/week: +30 cultivation", "7-day full week: +60 cultivation +1 stone"],
      monthly: [
        "20+ days/month: +100 cultivation",
        "26+ days/month: +180 cultivation +2 stones",
        "Full attendance: +300 cultivation +5 stones +3 merit"
      ]
    },
    makeup: {
      title: "Missed & Make-up",
      items: [
        "Breaking a streak resets streak days, but total cultivation stays",
        "Make-up costs 2 stones and is limited to the last 7 days",
        "Make-up only restores streak rewards, no daily check-in bonus",
        "Up to 3 make-ups per month"
      ]
    },
    realms: {
      title: "Realm Levels",
      columns: ["Realm", "Cultivation range", "Notes"],
      rows: [
        { level: "Qi Refining", range: "0–299", note: "Build the habit" },
        { level: "Foundation", range: "300–899", note: "Stable rhythm" },
        { level: "Golden Core", range: "900–1799", note: "Streaks accelerate progress" },
        { level: "Nascent Soul", range: "1800–2999", note: "Long-term output" },
        { level: "Spirit Form", range: "3000–4499", note: "Mid-term goals align" },
        { level: "Integration", range: "4500–6399", note: "High-frequency stability" },
        { level: "Ascension", range: "6400–8999", note: "Long-cycle consistency" },
        { level: "Tribulation", range: "9000–11999", note: "Final sprint" },
        { level: "Immortal", range: "12000+", note: "Long-term practitioner" }
      ]
    },
    tasks: {
      title: "Practice Tasks",
      dailyTitle: "Daily tasks (easy)",
      dailyReward: "+5 cultivation each (up to 3)",
      dailyItems: ["Write 1 practice goal for today", "Focus 10–15 minutes on study/reading", "Review 3 key points"],
      deepTitle: "Deep practice (hard)",
      deepReward: "+10 cultivation +1 merit",
      deepItems: [
        "120 minutes of uninterrupted focus",
        "Write a learning recap (≥ 800 words)",
        "High-intensity training (≥ 60 minutes) or ship a showcaseable output"
      ],
      note: "Tasks must be completed on the check-in day."
    },
    merits: {
      title: "Merit Sources",
      items: ["Publish a public tutorial: +3 merit", "Answer questions or submit feedback: +1 merit", "Complete a 30-day streak: +2 merit"]
    },
    antiCheat: {
      title: "Anti-abuse Rules",
      items: [
        "Contributions require review or quality checks",
        "Daily merit cap: max 3 merit per day",
        "Limit each contribution type to 3 per week, 12-hour cooldown",
        "Spam or duplicated content gets rejected and cooled down",
        "Freeze when daily growth exceeds the recorded daily gains",
        "Penalty: remove excess points and demote one realm"
      ]
    },
    exchange: {
      title: "Redemption & Spending",
      items: [
        "Stones can be used for make-ups, draws, or theme skins",
        "Merit can be used for event entry, highlights, or leaderboards"
      ]
    },
    footerNote: "These numbers are mock data until real tracking is connected.",
    announcements: [
      "Lin Yuan reached Golden Core · 30-day streak",
      "Su Li completed deep practice · 120 minutes focus",
      "Lu Xing hit a 3-day streak · earned bonus stones",
      "Qing He achieved weekly full attendance",
      "Xing He submitted a practice recap · +1 merit"
    ]
  }
};

function Card({
  title,
  description,
  children,
  className = ""
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-edge bg-surface/70 p-5 sm:p-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  const locale = getLocale();
  const { pages } = getMessages(locale);
  const copy = pages.tracker;
  const common = pages.common;
  const content = trackerContent[locale];
  const progressPercent = Math.min(
    100,
    Math.round((content.progress.current / content.progress.next) * 100)
  );

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12 sm:px-6 md:space-y-12 md:py-16">
      <header className="space-y-3">
        <p className="text-sm text-muted">{copy.eyebrow}</p>
        <h1 className="text-2xl font-semibold text-primary sm:text-3xl">{copy.title}</h1>
        <p className="text-sm text-muted">{copy.description}</p>
      </header>

      <section className="mt-4">
        <AnnouncementTicker items={content.announcements} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-edge bg-surface/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">{content.panel.eyebrow}</p>
              <h2 className="text-xl font-semibold text-primary">{content.panel.title}</h2>
              <p className="text-sm text-muted">{content.panel.description}</p>
            </div>
            <button
              type="button"
              disabled
              className="w-full rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white opacity-70 sm:w-auto"
            >
              {content.panel.button}
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {content.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-edge bg-base/40 p-4">
                <p className="text-xs text-muted">{stat.label}</p>
                <p className="mt-2 text-lg font-semibold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted">{stat.helper}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">{content.panel.note}</p>
        </div>

        <Card title={content.progress.title} description={content.progress.note}>
          <div className="flex items-center justify-between text-sm text-muted">
            <span>{content.progress.currentLabel}</span>
            <span>
              {content.progress.current} / {content.progress.next}
            </span>
            <span>{content.progress.nextLabel}</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-edge/60">
            <div
              className="h-2 rounded-full bg-accent transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-6 space-y-2 text-sm text-muted">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              {content.streakRewards.title}
            </p>
            {content.streakRewards.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span>{item.label}</span>
                <span className="text-secondary">{item.reward}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card title={content.rules.title}>
          <BulletList items={content.rules.items} />
        </Card>
        <Card title={content.specialDay.title}>
          <BulletList items={content.specialDay.items} />
        </Card>
        <Card title={content.makeup.title}>
          <BulletList items={content.makeup.items} />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title={content.settlement.title}>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">
                {content.settlement.weeklyLabel}
              </p>
              <BulletList items={content.settlement.weekly} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent">
                {content.settlement.monthlyLabel}
              </p>
              <BulletList items={content.settlement.monthly} />
            </div>
          </div>
        </Card>
        <Card title={content.tasks.title} description={content.tasks.note}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">{content.tasks.dailyTitle}</p>
                <span className="text-xs text-muted">{content.tasks.dailyReward}</span>
              </div>
              <BulletList items={content.tasks.dailyItems} />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-primary">{content.tasks.deepTitle}</p>
                <span className="text-xs text-muted">{content.tasks.deepReward}</span>
              </div>
              <BulletList items={content.tasks.deepItems} />
            </div>
          </div>
        </Card>
      </section>

      <section>
        <Card title={content.realms.title}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead>
                <tr className="border-b border-edge">
                  {content.realms.columns.map((col) => (
                    <th key={col} className="py-2 pr-4 text-xs font-semibold uppercase text-secondary">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.realms.rows.map((row) => (
                  <tr key={row.level} className="border-b border-edge/60">
                    <td className="py-2 pr-4 text-primary">{row.level}</td>
                    <td className="py-2 pr-4">{row.range}</td>
                    <td className="py-2 pr-4">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title={content.merits.title}>
          <BulletList items={content.merits.items} />
        </Card>
        <Card title={content.antiCheat.title}>
          <BulletList items={content.antiCheat.items} />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title={content.exchange.title}>
          <BulletList items={content.exchange.items} />
        </Card>
        <div className="rounded-2xl border border-edge bg-base/60 p-6">
          <p className="text-sm text-muted">{content.footerNote}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="/enter" className="text-accent hover:text-accent-strong">
              {common.backToEnter}
            </Link>
            <Link href="/" className="text-muted hover:text-primary">
              {common.backToHome}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
