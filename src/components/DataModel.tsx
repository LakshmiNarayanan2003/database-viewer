import { useAppStore } from '@/stores/useAppStore';
import { Database, Key, Link, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DataModel() {
  const { activeFileId, activeTable } = useAppStore();
  const activeFile = useAppStore(state => state.files.find(f => f.id === activeFileId));

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No file selected</p>
          <p className="text-sm">Open a database file to view its data model</p>
        </div>
      </div>
    );
  }

  // Simulate relationships based on foreign keys (SQLite adapter extracts this)
  const tables = activeFile.tables;

  return (
    <div className="flex-1 overflow-auto p-6 bg-background">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Data Model</h2>
        <p className="text-sm text-muted-foreground">
          {activeFile.name} • {tables.length} tables
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {tables.map((table) => (
          <div
            key={table.name}
            className={cn(
              'w-72 bg-card border border-border rounded-lg shadow-sm',
              'hover:shadow-md transition-shadow',
              activeTable?.name === table.name && 'ring-2 ring-primary'
            )}
          >
            {/* Table header */}
            <div className="px-4 py-3 border-b border-border bg-muted/50 rounded-t-lg flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{table.name}</span>
              {table.rowCount !== undefined && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {table.rowCount.toLocaleString()}
                </span>
              )}
            </div>

            {/* Columns */}
            <div className="p-2">
              {table.columns.map((column) => (
                <div
                  key={column.name}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/50 rounded"
                >
                  {column.primaryKey && (
                    <Key className="h-3 w-3 text-primary" />
                  )}
                  {column.foreignKey && (
                    <Link className="h-3 w-3 text-blue-500" />
                  )}
                  {!column.primaryKey && !column.foreignKey && (
                    <div className="w-3" />
                  )}
                  <span className={cn(
                    'flex-1 truncate',
                    column.primaryKey && 'font-medium'
                  )}>
                    {column.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {column.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Relationship legend */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-sm font-medium mb-3">Legend</h3>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            <span>Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-blue-500" />
            <span>Foreign Key</span>
          </div>
        </div>
      </div>

      {/* Relationship info */}
      {tables.some(t => t.columns.some(c => c.foreignKey)) && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Relationships
          </h3>
          <div className="text-sm text-muted-foreground">
            {tables.map(table => {
              const foreignKeys = table.columns.filter(c => c.foreignKey);
              if (foreignKeys.length === 0) return null;

              return (
                <div key={table.name} className="mb-2">
                  <span className="font-medium">{table.name}</span>
                  {foreignKeys.map(fk => (
                    <div key={fk.name} className="ml-4 text-xs">
                      {fk.name} → {fk.foreignKey}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
