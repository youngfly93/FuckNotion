"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/tailwind/ui/button";
import { db } from "@/lib/db/database";
import { storageManager } from "@/lib/db/storage-manager";
import Link from "next/link";
import { Home, Database, HardDrive, Check, X, AlertCircle } from "lucide-react";

interface StorageCheck {
  name: string;
  status: "checking" | "success" | "warning" | "error";
  message: string;
  details?: any;
}

export default function VerifyStoragePage() {
  const [checks, setChecks] = useState<StorageCheck[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const runVerification = async () => {
    setIsVerifying(true);
    const newChecks: StorageCheck[] = [];

    // 1. Check if IndexedDB is available
    try {
      if ("indexedDB" in window) {
        newChecks.push({
          name: "IndexedDB API 可用性",
          status: "success",
          message: "浏览器支持 IndexedDB",
        });
      } else {
        newChecks.push({
          name: "IndexedDB API 可用性",
          status: "error",
          message: "浏览器不支持 IndexedDB",
        });
      }
    } catch (error) {
      newChecks.push({
        name: "IndexedDB API 可用性",
        status: "error",
        message: "检查 IndexedDB 时出错",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 2. Check if Dexie database is open
    try {
      if (db.isOpen()) {
        newChecks.push({
          name: "Dexie 数据库连接",
          status: "success",
          message: "数据库已成功打开",
          details: {
            name: db.name,
            version: db.verno,
            tables: db.tables.map((t) => t.name),
          },
        });
      } else {
        await db.open();
        newChecks.push({
          name: "Dexie 数据库连接",
          status: "success",
          message: "数据库已重新打开",
          details: {
            name: db.name,
            version: db.verno,
            tables: db.tables.map((t) => t.name),
          },
        });
      }
    } catch (error) {
      newChecks.push({
        name: "Dexie 数据库连接",
        status: "error",
        message: "无法打开数据库",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 3. Check IndexedDB actual databases
    try {
      const databases = await indexedDB.databases();
      const fuckNotionDB = databases.find((db) => db.name === "FuckNotionDB");
      
      if (fuckNotionDB) {
        newChecks.push({
          name: "IndexedDB 数据库存在性",
          status: "success",
          message: "FuckNotionDB 数据库已创建",
          details: {
            databases: databases.map((db) => ({
              name: db.name,
              version: db.version,
            })),
          },
        });
      } else {
        newChecks.push({
          name: "IndexedDB 数据库存在性",
          status: "warning",
          message: "FuckNotionDB 数据库未找到",
          details: { databases },
        });
      }
    } catch (error) {
      newChecks.push({
        name: "IndexedDB 数据库存在性",
        status: "warning",
        message: "无法列出数据库（某些浏览器不支持）",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 4. Check pages count in IndexedDB
    try {
      const pageCount = await db.pages.count();
      const allPages = await db.pages.toArray();
      
      newChecks.push({
        name: "IndexedDB 页面数据",
        status: pageCount > 0 ? "success" : "warning",
        message: `IndexedDB 中有 ${pageCount} 个页面`,
        details: {
          count: pageCount,
          pages: allPages.map((p) => ({
            slug: p.slug,
            title: p.title,
            isSubPage: p.isSubPage,
            parentSlug: p.parentSlug,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          })),
        },
      });
    } catch (error) {
      newChecks.push({
        name: "IndexedDB 页面数据",
        status: "error",
        message: "无法读取页面数据",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 5. Check localStorage for legacy data
    try {
      const localStoragePages = localStorage.getItem("novel-pages");
      const hasLegacyData = localStoragePages !== null;
      const legacyPageCount = hasLegacyData
        ? Object.keys(JSON.parse(localStoragePages)).length
        : 0;

      newChecks.push({
        name: "localStorage 遗留数据",
        status: hasLegacyData ? "warning" : "success",
        message: hasLegacyData
          ? `localStorage 中仍有 ${legacyPageCount} 个页面数据`
          : "localStorage 中没有遗留数据",
        details: hasLegacyData ? JSON.parse(localStoragePages) : null,
      });
    } catch (error) {
      newChecks.push({
        name: "localStorage 遗留数据",
        status: "error",
        message: "无法检查 localStorage",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 6. Test write operation to IndexedDB
    try {
      const testSlug = `test-${Date.now()}`;
      const testId = await storageManager.savePage(testSlug, {
        title: "测试页面",
        content: { type: "doc", content: [] },
      });

      const savedPage = await storageManager.getPage(testSlug);
      
      if (savedPage) {
        await storageManager.deletePage(testSlug);
        newChecks.push({
          name: "IndexedDB 写入测试",
          status: "success",
          message: "成功创建、读取和删除测试页面",
          details: { testId, testSlug },
        });
      } else {
        newChecks.push({
          name: "IndexedDB 写入测试",
          status: "error",
          message: "创建页面后无法读取",
        });
      }
    } catch (error) {
      newChecks.push({
        name: "IndexedDB 写入测试",
        status: "error",
        message: "写入测试失败",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 7. Check storage quota
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usageInMB = ((estimate.usage || 0) / 1024 / 1024).toFixed(2);
        const quotaInMB = ((estimate.quota || 0) / 1024 / 1024).toFixed(2);
        const percentUsed = estimate.quota
          ? ((estimate.usage || 0) / estimate.quota) * 100
          : 0;

        newChecks.push({
          name: "存储配额",
          status: percentUsed > 90 ? "warning" : "success",
          message: `已使用 ${usageInMB} MB / ${quotaInMB} MB (${percentUsed.toFixed(
            2
          )}%)`,
          details: estimate,
        });
      } else {
        newChecks.push({
          name: "存储配额",
          status: "warning",
          message: "浏览器不支持存储配额 API",
        });
      }
    } catch (error) {
      newChecks.push({
        name: "存储配额",
        status: "error",
        message: "无法获取存储配额",
        details: error,
      });
    }
    setChecks([...newChecks]);

    // 8. Check persistent storage
    try {
      if ("storage" in navigator && "persist" in navigator.storage) {
        const isPersisted = await navigator.storage.persisted();
        newChecks.push({
          name: "持久化存储",
          status: isPersisted ? "success" : "warning",
          message: isPersisted
            ? "存储已设置为持久化"
            : "存储未设置为持久化（可能被浏览器清理）",
        });
      } else {
        newChecks.push({
          name: "持久化存储",
          status: "warning",
          message: "浏览器不支持持久化存储 API",
        });
      }
    } catch (error) {
      newChecks.push({
        name: "持久化存储",
        status: "error",
        message: "无法检查持久化存储状态",
        details: error,
      });
    }
    setChecks([...newChecks]);

    setIsVerifying(false);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const getStatusIcon = (status: StorageCheck["status"]) => {
    switch (status) {
      case "checking":
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />;
      case "success":
        return <Check className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <X className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: StorageCheck["status"]) => {
    switch (status) {
      case "checking":
        return "bg-gray-50 border-gray-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="mb-4">
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Database className="h-8 w-8" />
            存储验证工具
          </h1>
          <p className="text-gray-600">
            验证 FuckNotion 是否正确使用 IndexedDB 进行数据存储
          </p>
        </div>

        {/* Verification Results */}
        <div className="space-y-4">
          {checks.map((check, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${getStatusColor(
                check.status
              )}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{check.name}</h3>
                  <p className="text-sm text-gray-700 mt-1">{check.message}</p>
                  
                  {check.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        查看详细信息
                      </summary>
                      <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto">
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Re-run Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={runVerification}
            disabled={isVerifying}
            size="lg"
            className="gap-2"
          >
            <HardDrive className="h-5 w-5" />
            {isVerifying ? "正在验证..." : "重新验证"}
          </Button>
        </div>

        {/* Summary */}
        {checks.length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg border">
            <h2 className="font-semibold mb-3">验证总结</h2>
            <div className="space-y-2 text-sm">
              <p>
                ✅ 成功项：{" "}
                {checks.filter((c) => c.status === "success").length} 项
              </p>
              <p>
                ⚠️ 警告项：{" "}
                {checks.filter((c) => c.status === "warning").length} 项
              </p>
              <p>
                ❌ 错误项：{" "}
                {checks.filter((c) => c.status === "error").length} 项
              </p>
            </div>
            
            {checks.filter((c) => c.status === "error").length === 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  🎉 太好了！您的 FuckNotion 正在使用 IndexedDB 进行数据存储。
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}