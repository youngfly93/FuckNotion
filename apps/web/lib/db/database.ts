import Dexie, { type Table } from 'dexie';
import type { JSONContent } from 'novel';

// 页面数据模型
export interface Page {
  id?: number;
  slug: string;
  title: string;
  content: JSONContent; // TipTap JSON 格式
  htmlContent?: string; // 缓存的 HTML（用于导出和搜索）
  textContent?: string; // 纯文本（用于全文搜索）
  parentId?: number;
  parentSlug?: string;
  isSubPage?: boolean;
  hideFromSidebar?: boolean; // 是否在侧边栏中隐藏
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 附件数据模型
export interface Attachment {
  id?: number;
  pageId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: Date;
}

// 设置数据模型
export interface Setting {
  key: string;
  value: any;
}

// 页面版本历史（可选功能）
export interface PageVersion {
  id?: number;
  pageId: number;
  content: JSONContent;
  versionNumber: number;
  createdAt: Date;
}

// 数据库类
export class FuckNotionDB extends Dexie {
  // 声明表
  pages!: Table<Page>;
  attachments!: Table<Attachment>;
  settings!: Table<Setting>;
  pageVersions!: Table<PageVersion>;

  constructor() {
    super('FuckNotionDB');
    
    // 定义数据库 schema
    // 注意：只索引需要查询的字段
    this.version(1).stores({
      pages: '++id, slug, parentId, updatedAt, *tags',
      attachments: '++id, pageId, uploadedAt',
      settings: 'key',
      pageVersions: '++id, pageId, versionNumber, createdAt'
    });
  }
}

// 创建数据库实例
export const db = new FuckNotionDB();

// 数据库初始化函数
export async function initDatabase() {
  try {
    // 打开数据库
    await db.open();
    console.log('IndexedDB initialized successfully');
    
    // 检查存储配额
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      console.log(`Storage usage: ${estimate.usage} / ${estimate.quota} bytes`);
    }
    
    // 请求持久存储权限
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persistent storage granted: ${isPersisted}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
    return false;
  }
}

// 数据库错误处理
db.on('blocked', () => {
  console.warn('Database is blocked. Please close other tabs using this app.');
});

db.on('versionchange', () => {
  console.warn('A new version of the database is available. Please reload the page.');
});