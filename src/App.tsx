import { useAppStore } from '@/stores/useAppStore';
import { Sidebar } from '@/components/Sidebar';
import { DataTable } from '@/components/DataTable';
import { SchemaViewer } from '@/components/SchemaViewer';
import { StatusBar } from '@/components/StatusBar';
import { FileDropZone } from '@/components/FileDropZone';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Database, Layout, Moon, Sun } from 'lucide-react';

type TabType = 'data' | 'structure';

export function App() {
  const { files, activeTable } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const hasFiles = files.length > 0;
  const hasActiveTable = activeTable !== null;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <h1 className="text-lg font-semibold">Database Viewer</h1>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        {hasFiles && hasActiveTable ? (
          <div className="flex-1 flex flex-col">
            {/* Tab navigation */}
            <div className="border-b border-border bg-background">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'data'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layout className="h-4 w-4" />
                  Data
                </button>
                <button
                  onClick={() => setActiveTab('structure')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'structure'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  Structure
                </button>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'data' ? <DataTable /> : <SchemaViewer />}
          </div>
        ) : (
          <FileDropZone onFileLoaded={() => {}} />
        )}
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
