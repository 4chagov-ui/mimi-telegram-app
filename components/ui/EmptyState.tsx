type EmptyStateProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <p className="text-lg font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
