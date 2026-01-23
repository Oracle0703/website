"use client";

type AnnouncementTickerProps = {
  items: string[];
  label?: string;
};

export function AnnouncementTicker({
  items,
  label = "修行公告"
}: AnnouncementTickerProps) {
  const announcements = items.length > 0 ? items : ["暂无最新动态"];

  return (
    <div className="rounded-2xl border border-slate-800 bg-surface/60 px-4 py-3">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
          天机
        </span>
        <div className="ticker" aria-label={label}>
          <div className="ticker-track">
            <ul className="ticker-group">
              {announcements.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                  <span className="whitespace-nowrap">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="ticker-group" aria-hidden="true">
              {announcements.map((item, index) => (
                <li key={`${item}-${index}-duplicate`} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />
                  <span className="whitespace-nowrap">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
