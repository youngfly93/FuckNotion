import { useEffect, useState, useCallback } from 'react';
import { storageManager } from '@/lib/db/storage-manager';
import { initDatabase, type Page } from '@/lib/db/database';
import { DataMigration } from '@/lib/db/migration';
import type { JSONContent } from 'novel';

interface UsePages {
  pages: Record<string, Page>;
  currentPage: Page | null;
  isLoading: boolean;
  error: string | null;
  savePage: (slug: string, data: { title: string; content: JSONContent; parentSlug?: string; isSubPage?: boolean; hideFromSidebar?: boolean }) => Promise<void>;
  loadPage: (slug: string) => Promise<Page | null>;
  deletePage: (slug: string) => Promise<void>;
  getAllPages: () => Promise<Page[]>;
  searchPages: (query: string) => Promise<Page[]>;
  refreshPages: () => Promise<void>;
}

export const usePages = (): UsePages => {
  const [pages, setPages] = useState<Record<string, Page>>({});
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化和加载页面
  const refreshPages = useCallback(async () => {
    try {
      setError(null);
      
      // 初始化数据库
      await initDatabase();
      
      // 检查是否需要迁移
      if (await DataMigration.needsMigration()) {
        console.log('Migrating pages from localStorage to IndexedDB...');
        const result = await DataMigration.migrate();
        if (!result.success && result.errors.length > 0) {
          console.warn('Migration completed with errors:', result.errors);
        }
      }

      // 加载所有页面
      const allPages = await storageManager.getAllPages();
      const pagesMap: Record<string, Page> = {};
      
      allPages.forEach(page => {
        pagesMap[page.slug] = page;
      });
      
      setPages(pagesMap);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pages');
      setIsLoading(false);
      
      // Fallback 到 localStorage
      try {
        const legacyPages = localStorage.getItem('novel-pages');
        if (legacyPages) {
          const parsedPages = JSON.parse(legacyPages);
          setPages(parsedPages);
        }
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
      }
    }
  }, []);

  // 保存页面
  const savePage = useCallback(async (
    slug: string,
    data: {
      title: string;
      content: JSONContent;
      parentSlug?: string;
      isSubPage?: boolean;
      hideFromSidebar?: boolean;
    }
  ) => {
    try {
      setError(null);
      
      // 保存到 IndexedDB
      await storageManager.savePage(slug, data);
      
      // 更新本地状态
      const updatedPage = await storageManager.getPage(slug);
      if (updatedPage) {
        setPages(prev => ({
          ...prev,
          [slug]: updatedPage
        }));
        
        // 如果是当前页面，更新当前页面状态
        if (currentPage?.slug === slug) {
          setCurrentPage(updatedPage);
        }
      }
    } catch (err) {
      console.error('Error saving page:', err);
      setError(err instanceof Error ? err.message : 'Failed to save page');
      
      // Fallback 到 localStorage
      try {
        const existingPages = JSON.parse(localStorage.getItem('novel-pages') || '{}');
        const now = new Date();
        existingPages[slug] = {
          ...data,
          createdAt: existingPages[slug]?.createdAt || now.toISOString(),
          updatedAt: now.toISOString()
        };
        localStorage.setItem('novel-pages', JSON.stringify(existingPages));
        
        // 更新本地状态
        setPages(prev => ({
          ...prev,
          [slug]: {
            slug,
            ...existingPages[slug],
            createdAt: new Date(existingPages[slug].createdAt),
            updatedAt: new Date(existingPages[slug].updatedAt)
          }
        }));
      } catch (fallbackError) {
        console.error('Fallback save to localStorage failed:', fallbackError);
        throw err; // 重新抛出原始错误
      }
    }
  }, [currentPage]);

  // 加载单个页面
  const loadPage = useCallback(async (slug: string): Promise<Page | null> => {
    try {
      setError(null);
      
      // 首先从本地状态查找
      if (pages[slug]) {
        setCurrentPage(pages[slug]);
        return pages[slug];
      }
      
      // 从 IndexedDB 加载
      const page = await storageManager.getPage(slug);
      if (page) {
        setCurrentPage(page);
        setPages(prev => ({
          ...prev,
          [slug]: page
        }));
        return page;
      }
      
      // Fallback 到 localStorage
      const legacyPages = JSON.parse(localStorage.getItem('novel-pages') || '{}');
      if (legacyPages[slug]) {
        const legacyPage = {
          slug,
          ...legacyPages[slug],
          id: undefined,
          createdAt: new Date(legacyPages[slug].createdAt),
          updatedAt: new Date(legacyPages[slug].updatedAt)
        };
        setCurrentPage(legacyPage);
        return legacyPage;
      }
      
      return null;
    } catch (err) {
      console.error('Error loading page:', err);
      setError(err instanceof Error ? err.message : 'Failed to load page');
      return null;
    }
  }, [pages]);

  // 删除页面
  const deletePage = useCallback(async (slug: string) => {
    try {
      setError(null);
      
      // 从 IndexedDB 删除
      await storageManager.deletePage(slug);
      
      // 更新本地状态
      setPages(prev => {
        const newPages = { ...prev };
        delete newPages[slug];
        return newPages;
      });
      
      // 如果删除的是当前页面，清除当前页面
      if (currentPage?.slug === slug) {
        setCurrentPage(null);
      }
      
      // 同时从 localStorage 删除（兼容性）
      try {
        const legacyPages = JSON.parse(localStorage.getItem('novel-pages') || '{}');
        delete legacyPages[slug];
        localStorage.setItem('novel-pages', JSON.stringify(legacyPages));
      } catch (legacyError) {
        console.warn('Failed to delete from localStorage:', legacyError);
      }
    } catch (err) {
      console.error('Error deleting page:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete page');
      throw err;
    }
  }, [currentPage]);

  // 获取所有页面
  const getAllPages = useCallback(async (): Promise<Page[]> => {
    try {
      return await storageManager.getAllPages();
    } catch (err) {
      console.error('Error getting all pages:', err);
      return Object.values(pages);
    }
  }, [pages]);

  // 搜索页面
  const searchPages = useCallback(async (query: string): Promise<Page[]> => {
    try {
      return await storageManager.searchPages(query);
    } catch (err) {
      console.error('Error searching pages:', err);
      // Fallback 到本地搜索
      const allPages = Object.values(pages);
      const lowerQuery = query.toLowerCase();
      return allPages.filter(page => 
        page.title.toLowerCase().includes(lowerQuery) ||
        (page.textContent && page.textContent.toLowerCase().includes(lowerQuery))
      );
    }
  }, [pages]);

  // 初始化时加载数据
  useEffect(() => {
    refreshPages();
  }, [refreshPages]);

  return {
    pages,
    currentPage,
    isLoading,
    error,
    savePage,
    loadPage,
    deletePage,
    getAllPages,
    searchPages,
    refreshPages
  };
};