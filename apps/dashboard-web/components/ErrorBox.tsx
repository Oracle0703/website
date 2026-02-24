export function ErrorBox(props: { title?: string; message: string }) {
  return (
    <div className="rounded-lg border border-rose-400/35 bg-rose-500/12 px-4 py-3 text-sm shadow-[0_10px_30px_-24px_rgba(244,63,94,0.85)]">
      {props.title ? <div className="mb-1 font-medium text-rose-100">{props.title}</div> : null}
      <div className="whitespace-pre-wrap text-rose-100/90">{props.message}</div>
    </div>
  );
}
