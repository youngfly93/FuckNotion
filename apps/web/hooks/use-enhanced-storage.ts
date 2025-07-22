import { useEffect, useState, useCallback } from "react";
import { storageManager } from "@/lib/db/storage-manager";
import { initDatabase } from "@/lib/db/database";
import { DataMigration } from "@/lib/db/migration";

// 存储类型
type StorageType = 'setting' | 'legacy';

// 增强存储 hook，自动使用 IndexedDB（设置）或兼容模式（遗留数据）
const useEnhancedStorage = <T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'setting'
): [T, (value: T) => void, boolean] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化数据库和加载数据
  useEffect(() => {
    const initAndLoad = async () => {
      try {
        // 初始化 IndexedDB
        await initDatabase();
        
        // 检查是否需要迁移
        if (await DataMigration.needsMigration()) {
          console.log('Migrating data from localStorage to IndexedDB...');
          const result = await DataMigration.migrate();
          console.log('Migration result:', result);
        }

        // 根据存储类型加载数据
        let value: T | null = null;
        
        if (storageType === 'setting') {
          // 从 IndexedDB 设置表加载
          value = await storageManager.getSetting(key);
        } else {
          // 遗留模式：优先从 IndexedDB，fallback 到 localStorage
          value = await storageManager.getSetting(key);
          
          // 如果 IndexedDB 中没有，尝试从 localStorage
          if (value === undefined || value === null) {
            const item = window.localStorage.getItem(key);
            if (item) {
              try {
                value = JSON.parse(item);
                // 将 localStorage 数据迁移到 IndexedDB
                if (value !== null) {
                  await storageManager.saveSetting(key, value);
                }
              } catch (error) {
                console.error('Error parsing localStorage value:', error);
              }
            }
          }
        }
        
        if (value !== null && value !== undefined) {
          setStoredValue(value);
        }
      } catch (error) {
        console.error('Error loading from storage:', error);
        // Fallback 到 localStorage
        try {
          const item = window.localStorage.getItem(key);
          if (item) {
            setStoredValue(JSON.parse(item));
          }
        } catch (localStorageError) {
          console.error('Fallback localStorage also failed:', localStorageError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAndLoad();
  }, [key, storageType]);

  // 保存值的函数
  const setValue = useCallback(async (value: T) => {
    try {
      // 立即更新状态
      setStoredValue(value);
      
      if (storageType === 'setting') {
        // 保存到 IndexedDB
        await storageManager.saveSetting(key, value);
      } else {
        // 遗留模式：同时保存到 IndexedDB 和 localStorage
        await storageManager.saveSetting(key, value);
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving to storage:', error);
      // Fallback 到 localStorage
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (localStorageError) {
        console.error('Fallback localStorage save also failed:', localStorageError);
      }
    }
  }, [key, storageType]);

  return [storedValue, setValue, isLoading];
};

export default useEnhancedStorage;

// 为了向后兼容，导出原来的 useLocalStorage 接口
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [value, setValue, isLoading] = useEnhancedStorage(key, initialValue, 'legacy');
  
  // 为了兼容性，不返回 loading 状态
  return [value, setValue];
};

// 专门用于应用设置的 hook
export const useAppSetting = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, boolean] => {
  return useEnhancedStorage(key, initialValue, 'setting');
};