'use client';

import { usePages } from '@/hooks/use-pages';
import { useAppSetting } from '@/hooks/use-enhanced-storage';
import DataManager from '@/components/data-manager';
import { Button } from '@/components/ui/button';
import { Plus, Search, Settings } from 'lucide-react';
import { useState } from 'react';

/**
 * 这是一个集成示例，展示如何使用新的 IndexedDB 存储系统
 * 这个组件演示了：
 * 1. 使用 usePages hook 管理页面
 * 2. 使用 useAppSetting hook 管理设置
 * 3. 集成导出/导入功能
 */
export default function StorageIntegrationExample() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 使用新的页面管理 hook
  const {
    pages,
    currentPage,
    isLoading,
    error,
    savePage,
    loadPage,
    deletePage,
    searchPages,
    refreshPages
  } = usePages();

  // 使用新的设置管理 hook
  const [sidebarCollapsed, setSidebarCollapsed] = useAppSetting('sidebar-collapsed', false);
  const [theme, setTheme] = useAppSetting('theme', 'light');

  // 创建新页面的示例
  const handleCreatePage = async () => {
    const slug = `page-${Date.now()}`;
    const title = `New Page ${Object.keys(pages).length + 1}`;
    
    try {
      await savePage(slug, {
        title,
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `This is ${title}. Start writing here...`
                }
              ]
            }
          ]
        }
      });
      console.log('Page created successfully!');
    } catch (err) {
      console.error('Failed to create page:', err);
    }
  };

  // 搜索页面的示例
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await searchPages(searchQuery);
      console.log('Search results:', results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // 加载页面的示例
  const handleLoadPage = async (slug: string) => {
    try {
      const page = await loadPage(slug);
      console.log('Loaded page:', page);
    } catch (err) {
      console.error('Failed to load page:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
        <Button onClick={refreshPages} className="mt-2" size="sm">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">IndexedDB Storage Demo</h1>
        <div className="flex items-center gap-2">
          <DataManager />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            {sidebarCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Total Pages</h3>
          <p className="text-2xl font-bold text-blue-600">{Object.keys(pages).length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900">Current Page</h3>
          <p className="text-sm text-green-600">{currentPage?.title || 'None'}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-900">Theme</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="mt-1"
          >
            {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleCreatePage} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Page
        </Button>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Pages List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Pages ({Object.keys(pages).length})</h2>
        
        {Object.keys(pages).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pages yet. Create your first page!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(pages).map((page) => (
              <div
                key={page.slug}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleLoadPage(page.slug)}
              >
                <h3 className="font-medium mb-2">{page.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {page.textContent?.slice(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{page.updatedAt.toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.slug);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Settings Preview</h3>
        <div className="text-sm space-y-1">
          <p><strong>Sidebar Collapsed:</strong> {sidebarCollapsed ? 'Yes' : 'No'}</p>
          <p><strong>Theme:</strong> {theme}</p>
        </div>
      </div>

      {/* Migration Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Migration Information</h3>
        <p className="text-sm text-blue-700">
          This demo uses the new IndexedDB storage system. If you had data in localStorage, 
          it should have been automatically migrated when you first loaded the page.
        </p>
      </div>
    </div>
  );
}