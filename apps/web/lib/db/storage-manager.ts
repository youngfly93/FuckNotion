import { db, type Page } from './database';
import type { JSONContent } from 'novel';

// 从 TipTap JSON 提取纯文本
function extractTextFromJSON(content: JSONContent): string {
  let text = '';
  
  function traverse(node: any) {
    if (node.text) {
      text += node.text + ' ';
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(content);
  return text.trim();
}

// 生成简单的 HTML（用于导出）
function generateHTML(content: JSONContent): string {
  // 这里可以使用 TipTap 的 generateHTML 函数
  // 暂时返回一个简单的实现
  return `<div>${extractTextFromJSON(content)}</div>`;
}

export class StorageManager {
  // 保存或更新页面
  async savePage(slug: string, data: {
    title: string;
    content: JSONContent;
    parentSlug?: string;
    isSubPage?: boolean;
  }): Promise<number> {
    try {
      // 查找是否已存在
      const existingPage = await db.pages.where('slug').equals(slug).first();
      
      const now = new Date();
      const pageData: Page = {
        slug,
        title: data.title,
        content: data.content,
        textContent: extractTextFromJSON(data.content),
        htmlContent: generateHTML(data.content),
        parentSlug: data.parentSlug,
        isSubPage: data.isSubPage,
        updatedAt: now,
        createdAt: existingPage?.createdAt || now
      };
      
      // 如果有父页面，获取父页面 ID
      if (data.parentSlug) {
        const parentPage = await db.pages.where('slug').equals(data.parentSlug).first();
        if (parentPage) {
          pageData.parentId = parentPage.id;
        }
      }
      
      let pageId: number;
      if (existingPage) {
        // 更新现有页面
        await db.pages.update(existingPage.id!, pageData);
        pageId = existingPage.id!;
      } else {
        // 创建新页面
        pageId = await db.pages.add(pageData);
      }
      
      return pageId;
    } catch (error) {
      console.error('Error saving page:', error);
      throw error;
    }
  }
  
  // 获取页面
  async getPage(slug: string): Promise<Page | undefined> {
    try {
      return await db.pages.where('slug').equals(slug).first();
    } catch (error) {
      console.error('Error getting page:', error);
      throw error;
    }
  }
  
  // 获取所有页面
  async getAllPages(): Promise<Page[]> {
    try {
      return await db.pages.toArray();
    } catch (error) {
      console.error('Error getting all pages:', error);
      throw error;
    }
  }
  
  // 删除页面
  async deletePage(slug: string): Promise<void> {
    try {
      const page = await db.pages.where('slug').equals(slug).first();
      if (page) {
        // 删除子页面
        await db.pages.where('parentId').equals(page.id!).delete();
        // 删除页面本身
        await db.pages.delete(page.id!);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      throw error;
    }
  }
  
  // 搜索页面
  async searchPages(query: string): Promise<Page[]> {
    try {
      const lowerQuery = query.toLowerCase();
      
      // 搜索标题和内容
      const results = await db.pages
        .filter(page => {
          const titleMatch = page.title.toLowerCase().includes(lowerQuery);
          const contentMatch = page.textContent?.toLowerCase().includes(lowerQuery) || false;
          return titleMatch || contentMatch;
        })
        .toArray();
      
      // 按相关性排序（标题匹配优先）
      return results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(lowerQuery);
        const bTitle = b.title.toLowerCase().includes(lowerQuery);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
    } catch (error) {
      console.error('Error searching pages:', error);
      throw error;
    }
  }
  
  // 保存设置
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      await db.settings.put({ key, value });
    } catch (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  }
  
  // 获取设置
  async getSetting(key: string): Promise<any> {
    try {
      const setting = await db.settings.get(key);
      return setting?.value;
    } catch (error) {
      console.error('Error getting setting:', error);
      throw error;
    }
  }
  
  // 获取存储使用情况
  async getStorageInfo(): Promise<{
    pageCount: number;
    totalSize?: number;
    quota?: number;
    usage?: number;
    percentUsed?: number;
  }> {
    try {
      const pageCount = await db.pages.count();
      
      let storageInfo: any = { pageCount };
      
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        storageInfo = {
          ...storageInfo,
          quota: estimate.quota,
          usage: estimate.usage,
          percentUsed: estimate.quota ? (estimate.usage! / estimate.quota) * 100 : 0
        };
      }
      
      return storageInfo;
    } catch (error) {
      console.error('Error getting storage info:', error);
      throw error;
    }
  }
  
  // 清理旧数据（如果需要）
  async cleanupOldData(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // 删除旧的页面版本
      const deletedCount = await db.pageVersions
        .where('createdAt')
        .below(cutoffDate)
        .delete();
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }
}

// 创建单例实例
export const storageManager = new StorageManager();