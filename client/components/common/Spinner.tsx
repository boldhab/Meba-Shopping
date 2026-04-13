export function Spinner({ label = "Loading..." }: { label?: string }) {
  return <div className="panel">{label}</div>;
}
