interface Props { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode; }
export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-ink bg-white px-4 py-16 text-center">
      <div aria-hidden="true" className="mb-4 flex size-16 items-center justify-center border-2 border-ink bg-signal shadow-brutal-sm">{icon}</div>
      <h3 className="mb-2 font-display text-xl font-bold uppercase">{title}</h3>
      {description && <p className="mb-4 max-w-sm text-ink/70 text-pretty">{description}</p>}
      {action}
    </div>
  );
}
