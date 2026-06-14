interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card p-10 text-center">
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      {description && <p className="text-sm text-muted mb-4">{description}</p>}
      {action}
    </div>
  );
}
