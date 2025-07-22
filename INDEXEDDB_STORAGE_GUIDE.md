# IndexedDB Storage System Guide

FuckNotion 现在使用 IndexedDB 作为主要的本地存储解决方案，提供更大的存储容量、更好的性能和丰富的导出功能。

## 🚀 主要特性

- **大容量存储**: 突破 localStorage 5-10MB 限制，支持 GB 级数据
- **自动迁移**: 从 localStorage 无缝迁移到 IndexedDB
- **智能导出**: 支持 JSON、Markdown、HTML、Obsidian 格式
- **离线优先**: 完全本地运行，保护用户隐私
- **容错设计**: IndexedDB 失败时自动降级到 localStorage

## 📁 文件结构

```
apps/web/lib/db/
├── database.ts          # 数据库 schema 和初始化
├── storage-manager.ts   # 核心存储管理器
├── migration.ts         # 数据迁移工具
└── export-manager.ts    # 导出/导入功能

apps/web/hooks/
├── use-enhanced-storage.ts  # 增强版存储 hook
└── use-pages.ts            # 页面管理 hook

apps/web/components/
├── db-initializer.tsx       # 数据库初始化组件
├── data-manager.tsx         # 数据管理 UI
└── storage-integration-example.tsx  # 集成示例
```

## 🔧 安装和初始化

### 1. 安装依赖

```bash
# 安装 Dexie.js（已添加到 package.json）
pnpm install

# 或运行安装脚本
powershell -ExecutionPolicy Bypass -File install-deps.ps1
```

### 2. 应用级初始化

在你的根布局或应用入口添加数据库初始化器：

```tsx
// apps/web/app/layout.tsx
import DBInitializer from '@/components/db-initializer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DBInitializer>
          {children}
        </DBInitializer>
      </body>
    </html>
  );
}
```

## 📚 API 使用指南

### 页面管理

```tsx
import { usePages } from '@/hooks/use-pages';

function MyComponent() {
  const {
    pages,           // 所有页面的映射
    currentPage,     // 当前加载的页面
    isLoading,       // 加载状态
    error,           // 错误信息
    savePage,        // 保存页面
    loadPage,        // 加载页面
    deletePage,      // 删除页面
    searchPages,     // 搜索页面
    refreshPages     // 刷新页面列表
  } = usePages();

  // 创建新页面
  const createPage = async () => {
    await savePage('my-page', {
      title: 'My New Page',
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World!' }]
          }
        ]
      }
    });
  };

  // 加载特定页面
  const loadSpecificPage = async () => {
    const page = await loadPage('my-page');
    console.log('Loaded page:', page);
  };

  // 搜索页面
  const search = async () => {
    const results = await searchPages('hello');
    console.log('Search results:', results);
  };

  return (
    <div>
      {isLoading ? 'Loading...' : `${Object.keys(pages).length} pages loaded`}
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### 设置管理

```tsx
import { useAppSetting, useLocalStorage } from '@/hooks/use-enhanced-storage';

function SettingsComponent() {
  // 使用 IndexedDB 存储设置
  const [theme, setTheme, isLoading] = useAppSetting('theme', 'light');
  
  // 兼容模式（IndexedDB + localStorage fallback）
  const [apiKey, setApiKey] = useLocalStorage('api-key', '');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <div>
      <button onClick={toggleTheme}>
        Current theme: {theme}
      </button>
      <input
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="API Key"
      />
    </div>
  );
}
```

### 直接使用存储管理器

```tsx
import { storageManager } from '@/lib/db/storage-manager';

// 保存页面
await storageManager.savePage('page-slug', {
  title: 'Page Title',
  content: tiptapJson,
  parentSlug: 'parent-page',
  isSubPage: true
});

// 获取页面
const page = await storageManager.getPage('page-slug');

// 搜索页面
const results = await storageManager.searchPages('query');

// 保存设置
await storageManager.saveSetting('setting-key', 'setting-value');

// 获取设置
const value = await storageManager.getSetting('setting-key');

// 获取存储统计
const stats = await storageManager.getStorageInfo();
console.log(`${stats.pageCount} pages, ${stats.percentUsed}% storage used`);
```

## 📤 导出和导入

### 使用 UI 组件

```tsx
import DataManager from '@/components/data-manager';

function MyApp() {
  return (
    <div>
      {/* 这会添加一个"Data Manager"按钮，包含所有导出/导入功能 */}
      <DataManager />
    </div>
  );
}
```

### 程序化导出

```tsx
import { ExportManager } from '@/lib/db/export-manager';

// 导出为不同格式
const exportAsJSON = async () => {
  const result = await ExportManager.exportAs('json');
  if (result.success) {
    console.log('Exported to:', result.fileName);
  }
};

const exportAsMarkdown = async () => {
  const result = await ExportManager.exportAs('markdown');
  // 自动下载文件
};

// 导入数据
const handleFileImport = async (file: File) => {
  const result = await ExportManager.importFromJSON(file);
  console.log(`Imported ${result.importedPages} pages`);
};

// 获取存储统计
const stats = await ExportManager.getStorageStats();
console.log(stats);
```

## 🔄 数据迁移

系统会自动检测并迁移 localStorage 数据：

```tsx
import { DataMigration } from '@/lib/db/migration';

// 手动检查是否需要迁移
const needsMigration = await DataMigration.needsMigration();

// 手动执行迁移
if (needsMigration) {
  const result = await DataMigration.migrate();
  console.log(`Migrated ${result.migratedPages} pages`);
  
  if (result.errors.length > 0) {
    console.warn('Migration errors:', result.errors);
  }
}

// 清理 localStorage（保留备份）
await DataMigration.cleanupLocalStorage(true);

// 导出所有数据（用于备份）
const backupData = await DataMigration.exportAllData();

// 导入数据
const importResult = await DataMigration.importData(backupData);
```

## ⚡ 性能优化

### 1. 索引优化

数据库使用了以下索引：

```typescript
// 已优化的索引
this.version(1).stores({
  pages: '++id, slug, parentId, updatedAt, *tags',  // *tags 是多值索引
  attachments: '++id, pageId, uploadedAt',
  settings: 'key',
  pageVersions: '++id, pageId, versionNumber, createdAt'
});
```

### 2. 批量操作

```tsx
// 批量保存多个页面
const saveMultiplePages = async (pagesData: any[]) => {
  const promises = pagesData.map(data => 
    storageManager.savePage(data.slug, data)
  );
  await Promise.all(promises);
};
```

### 3. 存储配额管理

```tsx
// 检查和申请持久存储
if ('storage' in navigator && 'persist' in navigator.storage) {
  const isPersisted = await navigator.storage.persist();
  console.log('Persistent storage:', isPersisted);
}

// 监控存储使用
const stats = await storageManager.getStorageInfo();
if (stats.percentUsed > 80) {
  // 清理旧数据或提醒用户
  await storageManager.cleanupOldData(30); // 保留30天
}
```

## 🛡️ 错误处理

系统包含完整的错误处理和降级机制：

```tsx
try {
  await storageManager.savePage(slug, data);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    // 存储配额超出
    console.error('Storage quota exceeded');
  } else if (error.name === 'NotSupportedError') {
    // IndexedDB 不支持，降级到 localStorage
    localStorage.setItem(key, JSON.stringify(data));
  }
}
```

## 🔧 配置和自定义

### 修改数据库 Schema

```typescript
// apps/web/lib/db/database.ts
export class FuckNotionDB extends Dexie {
  constructor() {
    super('FuckNotionDB');
    
    // 版本 1
    this.version(1).stores({
      pages: '++id, slug, parentId, updatedAt, *tags'
    });
    
    // 版本 2 - 添加新表
    this.version(2).stores({
      pages: '++id, slug, parentId, updatedAt, *tags',
      newTable: '++id, name, value'  // 新增表
    });
  }
}
```

### 自定义导出格式

```typescript
// apps/web/lib/db/export-manager.ts
export class ExportManager {
  static async exportAsCustomFormat(): Promise<ExportResult> {
    const pages = await db.pages.toArray();
    
    // 自定义导出逻辑
    const customData = pages.map(page => ({
      // 你的自定义格式
    }));
    
    const fileName = `custom-export-${Date.now()}.json`;
    this.downloadFile(JSON.stringify(customData), fileName);
    
    return { success: true, fileName };
  }
}
```

## 🤝 与现有代码集成

### 替换现有的 localStorage 调用

```typescript
// 旧代码
const pages = JSON.parse(localStorage.getItem('novel-pages') || '{}');
localStorage.setItem('novel-pages', JSON.stringify(pages));

// 新代码
const { pages } = usePages();
await savePage(slug, pageData);
```

### 替换设置存储

```typescript
// 旧代码
const [setting, setSetting] = useLocalStorage('my-setting', defaultValue);

// 新代码
const [setting, setSetting] = useAppSetting('my-setting', defaultValue);
```

## 🐛 故障排除

### 常见问题

1. **IndexedDB 初始化失败**
   ```typescript
   // 检查浏览器支持
   if (!('indexedDB' in window)) {
     console.error('IndexedDB not supported');
   }
   ```

2. **存储配额超出**
   ```typescript
   const stats = await storageManager.getStorageInfo();
   if (stats.percentUsed > 90) {
     await storageManager.cleanupOldData();
   }
   ```

3. **迁移失败**
   ```typescript
   // 手动恢复备份
   const restored = await DataMigration.restoreFromBackup();
   ```

### 调试工具

在浏览器开发者工具中：

1. **Application** > **Storage** > **IndexedDB** > **FuckNotionDB**
2. **Console** 中查看迁移日志
3. 使用 `await storageManager.getStorageInfo()` 检查状态

## 📈 未来规划

- [ ] 添加数据压缩功能
- [ ] 实现增量备份
- [ ] 支持云同步适配器
- [ ] 添加版本历史功能
- [ ] 优化大文件处理

---

## 🎉 开始使用

现在您可以运行 `pnpm dev` 来体验新的 IndexedDB 存储系统！系统会自动迁移您的现有数据，并提供更强大的存储和导出功能。

如果遇到任何问题，请查看控制台日志或参考故障排除部分。