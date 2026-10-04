import { useAppStore } from '@/stores/useAppStore';
import { Shield, SidebarClose, SidebarOpen, Github } from 'lucide-react';

export function StatusBar() {
  const { files, activeFileId, activeTable, sidebarOpen, toggleSidebar } = useAppStore();

  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className="h-8 border-t border-border bg-background flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        {activeFile && (
          <>
            <span>{activeFile.name}</span>
            <span className="text-muted-foreground/50">|</span>
            <span className="capitalize">{activeFile.format}</span>
            <span className="text-muted-foreground/50">|</span>
            <span>{activeTable?.name || 'No table selected'}</span>
            {activeTable?.rowCount !== undefined && (
              <>
                <span className="text-muted-foreground/50">|</span>
                <span>{activeTable.rowCount.toLocaleString()} rows</span>
              </>
            )}
          </>
        )}
        {!activeFile && (
          <span>No file open</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          <span>Local only</span>
        </div>

        <a
          href="https://github.com/LakshmiNarayanan2003/database-viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-foreground"
        >
          <Github className="h-3 w-3" />
          <span>GitHub</span>
        </a>

        <button
          onClick={toggleSidebar}
          className="flex items-center gap-1 hover:text-foreground"
        >
          {sidebarOpen ? (
            <SidebarClose className="h-3 w-3" />
          ) : (
            <SidebarOpen className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}
