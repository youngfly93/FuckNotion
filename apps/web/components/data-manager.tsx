'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ExportManager, type ExportFormat } from '@/lib/db/export-manager';
import { Download, Upload, Database, FileText, Code, Globe, Archive } from 'lucide-react';
import { toast } from 'sonner';

export default function DataManager() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    pageCount: number;
    totalSize?: number;
    quota?: number;
    usage?: number;
    percentUsed?: number;
  } | null>(null);

  // 加载存储统计信息
  const loadStorageStats = async () => {
    try {
      const stats = await ExportManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  // 导出数据
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const result = await ExportManager.exportAs(format);
      if (result.success) {
        toast.success(`Successfully exported as ${format.toUpperCase()}`, {
          description: `File: ${result.fileName}`
        });
      } else {
        toast.error(`Export failed: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  // 导入数据
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const result = await ExportManager.importFromJSON(file);
      if (result.success) {
        toast.success(`Successfully imported ${result.importedPages} pages`);
      } else {
        toast.error(`Import failed`, {
          description: result.errors.join(', ')
        });
      }
    } catch (error) {
      toast.error(`Import failed: ${error}`);
    } finally {
      setIsImporting(false);
      // 重置文件输入
      event.target.value = '';
    }
  };

  const exportOptions = [
    {
      format: 'json' as ExportFormat,
      label: 'JSON Backup',
      description: 'Complete backup with all data',
      icon: Code,
      recommended: true
    },
    {
      format: 'markdown' as ExportFormat,
      label: 'Markdown Files',
      description: 'Text files for any editor',
      icon: FileText
    },
    {
      format: 'html' as ExportFormat,
      label: 'HTML Document',
      description: 'Viewable in any browser',
      icon: Globe
    },
    {
      format: 'obsidian' as ExportFormat,
      label: 'Obsidian Vault',
      description: 'Compatible with Obsidian',
      icon: Archive
    }
  ];

  const formatUsage = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={loadStorageStats}
          className="gap-2"
        >
          <Database className="h-4 w-4" />
          Data Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Data Management</DialogTitle>
          <DialogDescription>
            Export your data or import from backups
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Storage Stats */}
          {storageStats && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Storage Usage</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Pages:</span>
                  <span className="font-medium ml-2">{storageStats.pageCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Storage Used:</span>
                  <span className="font-medium ml-2">{formatUsage(storageStats.usage)}</span>
                </div>
                {storageStats.quota && (
                  <>
                    <div>
                      <span className="text-gray-600">Storage Quota:</span>
                      <span className="font-medium ml-2">{formatUsage(storageStats.quota)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Usage:</span>
                      <span className="font-medium ml-2">
                        {storageStats.percentUsed?.toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Export Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.format}
                    variant="outline"
                    className="h-auto p-4 justify-start flex-col items-start gap-2 relative"
                    onClick={() => handleExport(option.format)}
                    disabled={isExporting}
                  >
                    {option.recommended && (
                      <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                    <div className="flex items-center gap-2 w-full">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{option.description}</span>
                  </Button>
                );
              })}
            </div>
            {isExporting && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Preparing export...
              </p>
            )}
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className={`cursor-pointer ${isImporting ? 'opacity-50' : ''}`}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">
                  {isImporting ? 'Importing...' : 'Click to select JSON backup file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Only JSON backup files are supported for import
                </p>
              </label>
            </div>
            {isImporting && (
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Importing data...
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Importing data will merge with existing pages. 
              It&apos;s recommended to export your current data as a backup before importing.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}