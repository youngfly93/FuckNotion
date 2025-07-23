'use client';

import { usePages } from '@/hooks/use-pages';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export default function TestIndexedDBPage() {
  const { pages, savePage, loadPage, deletePage, searchPages, isLoading, error, refreshPages } = usePages();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${result}`]);
  };

  // 测试1：创建页面
  const testCreatePage = async () => {
    addTestResult('开始测试：创建页面...');
    try {
      const testSlug = `test-page-${Date.now()}`;
      await savePage(testSlug, {
        title: '测试页面',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '这是一个测试页面' }]
            }
          ]
        }
      });
      addTestResult(`✅ 成功创建页面: ${testSlug}`);
    } catch (err) {
      addTestResult(`❌ 创建页面失败: ${err}`);
    }
  };

  // 测试创建子页面
  const testCreateSubPage = async () => {
    addTestResult('开始测试：创建子页面...');
    const pageKeys = Object.keys(pages);
    if (pageKeys.length === 0) {
      addTestResult('❌ 没有父页面，请先创建一个页面');
      return;
    }
    
    try {
      const parentSlug = pageKeys[0];
      const testSlug = `sub-page-${Date.now()}`;
      await savePage(testSlug, {
        title: '测试子页面',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '这是一个测试子页面' }]
            }
          ]
        },
        parentSlug: parentSlug,
        isSubPage: true
      });
      addTestResult(`✅ 成功创建子页面: ${testSlug} (父页面: ${parentSlug})`);
    } catch (err) {
      addTestResult(`❌ 创建子页面失败: ${err}`);
    }
  };

  // 测试2：加载页面
  const testLoadPage = async () => {
    addTestResult('开始测试：加载页面...');
    const pageKeys = Object.keys(pages);
    if (pageKeys.length === 0) {
      addTestResult('❌ 没有页面可供加载');
      return;
    }
    
    try {
      const firstPageSlug = pageKeys[0];
      const page = await loadPage(firstPageSlug);
      if (page) {
        addTestResult(`✅ 成功加载页面: ${page.title} (${firstPageSlug})`);
      } else {
        addTestResult(`❌ 页面不存在: ${firstPageSlug}`);
      }
    } catch (err) {
      addTestResult(`❌ 加载页面失败: ${err}`);
    }
  };

  // 测试3：搜索页面
  const testSearchPages = async () => {
    if (!searchQuery.trim()) {
      addTestResult('❌ 请输入搜索关键词');
      return;
    }
    
    addTestResult(`开始测试：搜索页面 "${searchQuery}"...`);
    try {
      const results = await searchPages(searchQuery);
      setSearchResults(results);
      addTestResult(`✅ 搜索完成，找到 ${results.length} 个结果`);
    } catch (err) {
      addTestResult(`❌ 搜索失败: ${err}`);
    }
  };

  // 测试4：删除页面
  const testDeletePage = async () => {
    addTestResult('开始测试：删除页面...');
    const pageKeys = Object.keys(pages);
    const testPages = pageKeys.filter(key => key.startsWith('test-page-'));
    
    if (testPages.length === 0) {
      addTestResult('❌ 没有测试页面可供删除');
      return;
    }
    
    try {
      const pageToDelete = testPages[0];
      await deletePage(pageToDelete);
      addTestResult(`✅ 成功删除页面: ${pageToDelete}`);
    } catch (err) {
      addTestResult(`❌ 删除页面失败: ${err}`);
    }
  };

  // 修复旧页面数据
  const fixOldPages = async () => {
    addTestResult('开始修复旧页面数据...');
    try {
      const { db } = await import('@/lib/db/database');
      const allPages = await db.pages.toArray();
      let fixedCount = 0;
      
      for (const page of allPages) {
        if (page.isSubPage === undefined || page.isSubPage === null) {
          // 更新整个页面对象，确保字段被设置
          const updatedPage = {
            ...page,
            isSubPage: false,
            parentSlug: page.parentSlug || null
          };
          
          await db.pages.put(updatedPage);
          fixedCount++;
          addTestResult(`✅ 修复页面: ${page.slug}`);
        }
      }
      
      addTestResult(`✅ 共修复 ${fixedCount} 个页面`);
      
      // 刷新页面数据
      await refreshPages();
    } catch (error) {
      addTestResult(`❌ 修复失败: ${error}`);
    }
  };

  // 直接查询数据库
  const queryDatabase = async () => {
    addTestResult('直接查询 IndexedDB 数据...');
    try {
      const { db } = await import('@/lib/db/database');
      const allPages = await db.pages.toArray();
      
      addTestResult(`数据库中共有 ${allPages.length} 个页面`);
      
      allPages.forEach(page => {
        addTestResult(`页面: ${page.slug}`);
        addTestResult(`  - title: ${page.title}`);
        addTestResult(`  - isSubPage: ${page.isSubPage}`);
        addTestResult(`  - parentSlug: ${page.parentSlug}`);
      });
    } catch (error) {
      addTestResult(`❌ 查询数据库失败: ${error}`);
    }
  };

  // 检查 IndexedDB 状态
  const checkIndexedDBStatus = async () => {
    addTestResult('检查 IndexedDB 状态...');
    
    // 检查浏览器支持
    if (!('indexedDB' in window)) {
      addTestResult('❌ 浏览器不支持 IndexedDB');
      return;
    }
    addTestResult('✅ 浏览器支持 IndexedDB');
    
    // 检查数据库
    try {
      const databases = await indexedDB.databases();
      const fuckNotionDB = databases.find(db => db.name === 'FuckNotionDB');
      if (fuckNotionDB) {
        addTestResult(`✅ FuckNotionDB 已创建 (版本: ${fuckNotionDB.version})`);
      } else {
        addTestResult('❌ FuckNotionDB 未找到');
      }
    } catch (err) {
      addTestResult('⚠️ 无法列出数据库（某些浏览器不支持）');
    }
    
    // 检查存储配额
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentUsed = quota > 0 ? (usage / quota * 100).toFixed(2) : 0;
        addTestResult(`✅ 存储使用: ${(usage / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024 / 1024).toFixed(2)} GB (${percentUsed}%)`);
      } catch (err) {
        addTestResult('❌ 无法获取存储信息');
      }
    }
  };

  useEffect(() => {
    checkIndexedDBStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">IndexedDB 测试页面</h1>
        <p>正在加载...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">IndexedDB 测试页面</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          错误: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：测试控制 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          
          <div className="space-y-4">
            <Button onClick={testCreatePage} className="w-full">
              创建测试页面
            </Button>
            
            <Button onClick={testCreateSubPage} className="w-full" variant="secondary">
              创建测试子页面
            </Button>
            
            <Button onClick={testLoadPage} className="w-full">
              加载第一个页面
            </Button>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="输入搜索关键词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
              />
              <Button onClick={testSearchPages}>搜索</Button>
            </div>
            
            <Button onClick={testDeletePage} variant="destructive" className="w-full">
              删除测试页面
            </Button>
            
            <Button onClick={queryDatabase} variant="outline" className="w-full">
              直接查询数据库
            </Button>
            
            <Button onClick={fixOldPages} variant="secondary" className="w-full">
              修复旧页面数据
            </Button>
            
            <Button onClick={checkIndexedDBStatus} variant="outline" className="w-full">
              重新检查 IndexedDB 状态
            </Button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">当前页面 ({Object.keys(pages).length})</h3>
            <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
              {Object.keys(pages).length === 0 ? (
                <p className="text-gray-500">没有页面</p>
              ) : (
                <ul className="space-y-1">
                  {Object.entries(pages).map(([slug, page]) => (
                    <li key={slug} className="text-sm">
                      <span className="font-medium">{page.title}</span>
                      <span className="text-gray-500 ml-2">({slug})</span>
                      {page.isSubPage && (
                        <span className="text-blue-500 ml-2">
                          [子页面 - 父: {page.parentSlug}]
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">搜索结果 ({searchResults.length})</h3>
              <div className="bg-blue-50 p-4 rounded">
                {searchResults.map((result, index) => (
                  <div key={index} className="text-sm mb-2">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-gray-600 ml-2">({result.slug})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：测试结果 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p>等待测试...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))
            )}
          </div>
          
          <Button 
            onClick={() => setTestResults([])} 
            variant="outline" 
            className="mt-4"
          >
            清空日志
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">使用说明</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• 打开浏览器开发者工具 (F12)</li>
          <li>• 进入 Application → Storage → IndexedDB → FuckNotionDB</li>
          <li>• 可以查看 pages、settings 等表的数据</li>
          <li>• 测试各项功能，观察数据变化</li>
        </ul>
      </div>
    </div>
  );
}