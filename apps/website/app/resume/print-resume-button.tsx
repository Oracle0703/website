"use client";

type PrintResumeButtonProps = {
  label: string;
};

export function PrintResumeButton({ label }: PrintResumeButtonProps) {
  return (
    <button
      type="button"
      className="btn-secondary resume-no-print"
      onClick={() => window.print()}
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
        <path
          d="M5.5 7V3.5h9V7M5 14H3.5V8.5h13V14H15m-9.5-3h9v5.5h-9V11Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
      </svg>
      {label}
    </button>
  );
}
