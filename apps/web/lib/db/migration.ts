import { storageManager } from './storage-manager';
import { db } from './database';
import type { JSONContent } from 'novel';

export class DataMigration {
  // 检查是否需要迁移
  static async needsMigration(): Promise<boolean> {
    // 检查 localStorage 中是否有数据
    const hasPages = localStorage.getItem('novel-pages') !== null;
    const hasContent = localStorage.getItem('novel-content') !== null;
    
    // 检查是否已经迁移过
    const migrated = localStorage.getItem('indexeddb-migrated') === 'true';
    
    return (hasPages || hasContent) && !migrated;
  }
  
  // 执行迁移
  static async migrate(): Promise<{
    success: boolean;
    migratedPages: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let migratedPages = 0;
    
    try {
      console.log('Starting data migration from localStorage to IndexedDB...');
      
      // 1. 迁移页面数据
      const pagesJson = localStorage.getItem('novel-pages');
      if (pagesJson) {
        try {
          const pages = JSON.parse(pagesJson);
          
          for (const [slug, pageData] of Object.entries(pages)) {
            try {
              const page = pageData as any;
              await storageManager.savePage(slug, {
                title: page.title || 'Untitled',
                content: page.content || { type: 'doc', content: [] },
                parentSlug: page.parentSlug,
                isSubPage: page.isSubPage
              });
              migratedPages++;
            } catch (error) {
              errors.push(`Failed to migrate page ${slug}: ${error}`);
              console.error(`Error migrating page ${slug}:`, error);
            }
          }
        } catch (error) {
          errors.push(`Failed to parse pages data: ${error}`);
          console.error('Error parsing pages data:', error);
        }
      }
      
      // 2. 迁移当前编辑器内容
      const currentContent = localStorage.getItem('novel-content');
      if (currentContent) {
        try {
          const content = JSON.parse(currentContent) as JSONContent;
          await storageManager.savePage('index', {
            title: 'Home',
            content: content
          });
          migratedPages++;
        } catch (error) {
          errors.push(`Failed to migrate current content: ${error}`);
          console.error('Error migrating current content:', error);
        }
      }
      
      // 3. 迁移 API 配置
      const apiConfig = localStorage.getItem('novel-api-config');
      if (apiConfig) {
        try {
          const config = JSON.parse(apiConfig);
          await storageManager.saveSetting('api-config', config);
        } catch (error) {
          errors.push(`Failed to migrate API config: ${error}`);
          console.error('Error migrating API config:', error);
        }
      }
      
      // 4. 迁移背景设置
      const bgImage = localStorage.getItem('novel-background-image');
      const bgOpacity = localStorage.getItem('novel-background-opacity');
      
      if (bgImage) {
        await storageManager.saveSetting('background-image', bgImage);
      }
      
      if (bgOpacity) {
        await storageManager.saveSetting('background-opacity', parseFloat(bgOpacity));
      }
      
      // 5. 迁移折叠状态
      const collapsedPages = localStorage.getItem('novel-collapsed-pages');
      if (collapsedPages) {
        try {
          const collapsed = JSON.parse(collapsedPages);
          await storageManager.saveSetting('collapsed-pages', collapsed);
        } catch (error) {
          errors.push(`Failed to migrate collapsed pages: ${error}`);
          console.error('Error migrating collapsed pages:', error);
        }
      }
      
      // 6. 标记迁移完成
      localStorage.setItem('indexeddb-migrated', 'true');
      
      console.log(`Migration completed. Migrated ${migratedPages} pages with ${errors.length} errors.`);
      
      return {
        success: errors.length === 0,
        migratedPages,
        errors
      };
    } catch (error) {
      console.error('Fatal error during migration:', error);
      return {
        success: false,
        migratedPages,
        errors: [...errors, `Fatal error: ${error}`]
      };
    }
  }
  
  // 清理 localStorage（可选，在确认迁移成功后调用）
  static async cleanupLocalStorage(keepBackup: boolean = true): Promise<void> {
    if (keepBackup) {
      // 创建备份
      const backup: Record<string, any> = {};
      const keysToBackup = [
        'novel-pages',
        'novel-content',
        'novel-api-config',
        'novel-background-image',
        'novel-background-opacity',
        'novel-collapsed-pages'
      ];
      
      keysToBackup.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          backup[key] = value;
        }
      });
      
      // 保存备份
      localStorage.setItem('novel-localStorage-backup', JSON.stringify(backup));
      localStorage.setItem('novel-localStorage-backup-date', new Date().toISOString());
    }
    
    // 清理旧数据
    const keysToRemove = [
      'novel-pages',
      'novel-content',
      'html-content',
      'markdown',
      'novel-collapsed-pages'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('LocalStorage cleaned up. Backup created:', keepBackup);
  }
  
  // 恢复备份（如果需要）
  static async restoreFromBackup(): Promise<boolean> {
    try {
      const backup = localStorage.getItem('novel-localStorage-backup');
      if (!backup) {
        console.log('No backup found');
        return false;
      }
      
      const backupData = JSON.parse(backup);
      Object.entries(backupData).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
      
      // 重置迁移标记
      localStorage.removeItem('indexeddb-migrated');
      
      console.log('Backup restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
  
  // 导出所有数据（用于手动备份）
  static async exportAllData(): Promise<{
    pages: any[];
    settings: any;
    exportDate: string;
    version: string;
  }> {
    const pages = await db.pages.toArray();
    const settings: Record<string, any> = {};
    
    // 获取所有设置
    const allSettings = await db.settings.toArray();
    allSettings.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    return {
      pages: pages.map(page => ({
        ...page,
        id: undefined // 移除 ID 以便导入时生成新 ID
      })),
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  }
  
  // 导入数据
  static async importData(data: any): Promise<{
    success: boolean;
    importedPages: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let importedPages = 0;
    
    try {
      // 验证数据格式
      if (!data.pages || !Array.isArray(data.pages)) {
        throw new Error('Invalid data format: pages array not found');
      }
      
      // 导入页面
      for (const page of data.pages) {
        try {
          await storageManager.savePage(page.slug, {
            title: page.title,
            content: page.content,
            parentSlug: page.parentSlug,
            isSubPage: page.isSubPage
          });
          importedPages++;
        } catch (error) {
          errors.push(`Failed to import page ${page.slug}: ${error}`);
        }
      }
      
      // 导入设置
      if (data.settings) {
        for (const [key, value] of Object.entries(data.settings)) {
          try {
            await storageManager.saveSetting(key, value);
          } catch (error) {
            errors.push(`Failed to import setting ${key}: ${error}`);
          }
        }
      }
      
      return {
        success: errors.length === 0,
        importedPages,
        errors
      };
    } catch (error) {
      return {
        success: false,
        importedPages,
        errors: [`Import failed: ${error}`]
      };
    }
  }
}