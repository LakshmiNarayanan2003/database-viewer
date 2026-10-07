import { useAppStore } from '@/stores/useAppStore';
import { Sidebar } from '@/components/Sidebar';
import { DataTable } from '@/components/DataTable';
import { SchemaViewer } from '@/components/SchemaViewer';
import { SqlEditor } from '@/components/SqlEditor';
import { DataModel } from '@/components/DataModel';
import { UploadModal } from '@/components/UploadModal';
import { StatusBar } from '@/components/StatusBar';
import { FileDropZone } from '@/components/FileDropZone';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { Database, Layout, Moon, Sun, Code, Network, Upload } from 'lucide-react';

type TabType = 'data' | 'structure' | 'sql' | 'model';

export function App() {
  const { files, activeFileId } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('data');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const hasFiles = files.length > 0;
  const activeFile = files.find(f => f.id === activeFileId);
  const supportsSQL = activeFile?.supportsSQL || false;

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" width={28} height={28} className="rounded-md dark:ring-1 dark:ring-border" />
            <h1 className="text-base font-semibold tracking-tight">Database Viewer</h1>
          </div>
          {hasFiles && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
          )}
        </div>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
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

        {hasFiles ? (
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
                {supportsSQL && (
                  <button
                    onClick={() => setActiveTab('sql')}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'sql'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    SQL
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('model')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'model'
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Network className="h-4 w-4" />
                  Model
                </button>
              </div>
            </div>

            {/* Tab content */}
            {activeTab === 'data' ? (
              <DataTable />
            ) : activeTab === 'structure' ? (
              <SchemaViewer />
            ) : activeTab === 'sql' ? (
              <SqlEditor />
            ) : (
              <DataModel />
            )}
          </div>
        ) : (
          <FileDropZone onFileLoaded={() => {}} />
        )}
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onFileLoaded={() => {}}
      />
    </div>
  );
}
