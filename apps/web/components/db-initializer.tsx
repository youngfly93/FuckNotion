'use client';

import { useEffect, useState } from 'react';
import { initDatabase } from '@/lib/db/database';
import { DataMigration } from '@/lib/db/migration';

interface DBInitializerProps {
  children: React.ReactNode;
}

export default function DBInitializer({ children }: DBInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationInfo, setMigrationInfo] = useState<{
    needsMigration: boolean;
    isCompleted: boolean;
    migratedPages: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 初始化 IndexedDB
        console.log('Initializing IndexedDB...');
        const dbInitialized = await initDatabase();
        
        if (!dbInitialized) {
          throw new Error('Failed to initialize IndexedDB');
        }

        // 检查是否需要迁移
        const needsMigration = await DataMigration.needsMigration();
        console.log('Needs migration:', needsMigration);

        let migrationResult = {
          needsMigration,
          isCompleted: !needsMigration,
          migratedPages: 0,
          errors: []
        };

        if (needsMigration) {
          console.log('Starting data migration from localStorage to IndexedDB...');
          const result = await DataMigration.migrate();
          
          migrationResult = {
            needsMigration: true,
            isCompleted: result.success,
            migratedPages: result.migratedPages,
            errors: result.errors
          };

          console.log('Migration completed:', result);

          // 如果迁移成功且没有错误，清理 localStorage（保留备份）
          if (result.success && result.errors.length === 0) {
            // 延迟清理，给用户一些时间验证数据
            setTimeout(() => {
              console.log('Cleaning up localStorage after successful migration');
              DataMigration.cleanupLocalStorage(true);
            }, 5000);
          }
        }

        setMigrationInfo(migrationResult);
        setIsInitialized(true);
      } catch (err) {
        console.error('Database initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown initialization error');
        
        // 即使初始化失败，也显示应用（降级到 localStorage）
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Initializing FuckNotion...</p>
          <p className="text-sm text-gray-600 mt-2">Setting up local storage</p>
        </div>
      </div>
    );
  }

  // 错误状态（但仍然渲染应用）
  if (error) {
    console.warn('Database initialization error (continuing with fallback):', error);
    // 可以在这里添加一个非阻塞的错误通知
  }

  // 迁移完成通知
  if (migrationInfo?.needsMigration && migrationInfo?.isCompleted && migrationInfo.migratedPages > 0) {
    // 显示一个成功通知（可以使用 toast 或其他 UI 组件）
    console.log(`Successfully migrated ${migrationInfo.migratedPages} pages to IndexedDB`);
    
    // 如果有错误，也要显示警告
    if (migrationInfo.errors.length > 0) {
      console.warn('Migration completed with some errors:', migrationInfo.errors);
    }
  }

  // 渲染应用
  return <>{children}</>;
}