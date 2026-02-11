export function ErrorBox(props: { title?: string; message: string }) {
  return (
    <div className="rounded-md border border-edge bg-surface px-4 py-3 text-sm">
      {props.title ? <div className="mb-1 font-medium text-primary">{props.title}</div> : null}
      <div className="whitespace-pre-wrap text-secondary">{props.message}</div>
    </div>
  );
}
