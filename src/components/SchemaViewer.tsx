import { useAppStore } from '@/stores/useAppStore';
import { Database, Key, Hash } from 'lucide-react';

export function SchemaViewer() {
  const { activeTable } = useAppStore();

  if (!activeTable) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">No table selected</p>
          <p className="text-sm">Select a table to view its schema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <h3 className="text-lg font-semibold mb-4">{activeTable.name}</h3>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-4 font-medium">Column</th>
            <th className="text-left py-2 px-4 font-medium">Type</th>
            <th className="text-left py-2 px-4 font-medium">Nullable</th>
            <th className="text-left py-2 px-4 font-medium">Primary Key</th>
            <th className="text-left py-2 px-4 font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {activeTable.columns.map((column, index) => (
            <tr key={index} className="border-b border-border">
              <td className="py-2 px-4 flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                {column.name}
              </td>
              <td className="py-2 px-4">{column.type}</td>
              <td className="py-2 px-4">
                {column.nullable ? (
                  <span className="text-muted-foreground">Yes</span>
                ) : (
                  <span className="text-destructive">No</span>
                )}
              </td>
              <td className="py-2 px-4">
                {column.primaryKey ? (
                  <Key className="h-4 w-4 text-primary" />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="py-2 px-4">
                {column.defaultValue !== undefined ? (
                  <span className="text-xs">{String(column.defaultValue)}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeTable.rowCount !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          <span>Total rows: {activeTable.rowCount.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
