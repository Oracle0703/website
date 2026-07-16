"use client";

import { TEXT_XS_SECONDARY } from "../lib/typography";

type AnnouncementTickerProps = {
  items: string[];
  label: string;
  kicker: string;
  emptyMessage: string;
};

export function AnnouncementTicker({
  items,
  label,
  kicker,
  emptyMessage
}: AnnouncementTickerProps) {
  const announcements = items.length > 0 ? items : [emptyMessage];

  return (
    <div className="rounded-2xl border border-edge bg-surface/60 px-3 py-3 sm:px-4">
      <div className={`flex items-center gap-2 ${TEXT_XS_SECONDARY} sm:gap-3 sm:text-sm`}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent sm:text-xs">
          {kicker}
        </span>
        <div className="ticker" aria-label={label}>
          <div className="ticker-track">
            <ul className="ticker-group">
              {announcements.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/80" />
                  <span className="whitespace-nowrap">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="ticker-group" aria-hidden="true">
              {announcements.map((item, index) => (
                <li key={`${item}-${index}-duplicate`} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent/60" />
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
