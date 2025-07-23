"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/tailwind/ui/button";
import { Home, FileText, Plus, Settings, X, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useBackground } from "@/contexts/background-context";
import { usePages } from "@/hooks/use-pages";

interface PageData {
  title: string;
  content: unknown;
  createdAt: string;
  updatedAt: string;
  parentSlug?: string;
  isSubPage?: boolean;
  hideFromSidebar?: boolean;
}

interface PagesList {
  [slug: string]: PageData;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { backgroundImage } = useBackground();
  // 使用 IndexedDB 存储系统
  const { pages: indexedDBPages, deletePage: deletePageFromDB, isLoading } = usePages();
  // 初始化为空集合，这样所有页面默认都是展开的
  const [collapsedPages, setCollapsedPages] = useState<Set<string>>(new Set());
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);

  // 将 IndexedDB 的页面数据转换为兼容的格式
  const pages: PagesList = {};
  console.log('IndexedDB pages count:', Object.keys(indexedDBPages).length);
  console.log('IndexedDB pages:', indexedDBPages);

  // 验证IndexedDB是否真正在使用
  if (typeof window !== 'undefined') {
    (window as any).verifyIndexedDB = async () => {
      try {
        const { db } = await import('@/lib/db/database');
        const allPages = await db.pages.toArray();
        console.log('Direct IndexedDB query result:', allPages);

        // 检查localStorage中是否还有数据
        const localStoragePages = localStorage.getItem('novel-pages');
        console.log('localStorage pages:', localStoragePages ? JSON.parse(localStoragePages) : 'No data');

        return { indexedDB: allPages, localStorage: localStoragePages };
      } catch (error) {
        console.error('Error verifying IndexedDB:', error);
        return { error };
      }
    };
  }
  
  Object.values(indexedDBPages).forEach((page) => {
    pages[page.slug] = {
      title: page.title,
      content: page.content,
      createdAt: page.createdAt.toISOString(),
      updatedAt: page.updatedAt.toISOString(),
      parentSlug: page.parentSlug,
      isSubPage: page.isSubPage,
      hideFromSidebar: page.hideFromSidebar,
    };
  });

  const deletePage = useCallback(
    async (slug: string, e?: React.MouseEvent | React.KeyboardEvent) => {
      console.log("deletePage called with slug:", slug);
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      try {
        // 使用 IndexedDB 删除页面
        await deletePageFromDB(slug);

        // If currently on the deleted page, redirect to home
        if (pathname === `/page/${slug}`) {
          router.push("/");
        }

        // Clear selection after deletion
        setSelectedPageSlug(null);
        console.log("Page deleted successfully:", slug);
      } catch (error) {
        console.error("删除页面时出错:", error);
        // In desktop app, we can't use alert, so just log the error
        console.error("删除页面失败");
      }
    },
    [deletePageFromDB, pathname, router],
  );

  useEffect(() => {
    // 清除之前保存的折叠状态，确保所有页面默认展开
    localStorage.removeItem("novel-collapsed-pages");
    
    // 确保 collapsedPages 是空的
    setCollapsedPages(new Set());
    
    // 默认展开所有页面，不加载折叠状态
    // 用户的手动折叠操作仍然会被保存，但刷新页面后会重置为全部展开
    
    // 页面数据现在通过 usePages hook 自动更新，不需要手动监听

    return () => {
      // Cleanup not needed anymore
    };
  }, []);

  // Handle keyboard events for deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Delete key is pressed and a page is selected
      if ((e.key === "Delete" || e.key === "Backspace") && selectedPageSlug) {
        // Prevent deletion on input fields
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true") {
          return;
        }

        // For Tauri desktop app, we need to ensure the sidebar has focus
        const sidebarElement = document.getElementById("sidebar-content");
        if (sidebarElement && !sidebarElement.contains(target)) {
          // If the event target is not within the sidebar, ignore it
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        deletePage(selectedPageSlug);
      }
    };

    // Use capture phase to ensure we get the event first
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [selectedPageSlug, deletePage]);

  const togglePageCollapse = (slug: string) => {
    const newCollapsedPages = new Set(collapsedPages);
    if (newCollapsedPages.has(slug)) {
      newCollapsedPages.delete(slug);
    } else {
      newCollapsedPages.add(slug);
    }
    setCollapsedPages(newCollapsedPages);
    // 不再保存到 localStorage，这样刷新页面后会重置为全部展开
    // localStorage.setItem("novel-collapsed-pages", JSON.stringify(Array.from(newCollapsedPages)));
  };

  const createNewPage = () => {
    try {
      // Generate a unique slug using timestamp
      const timestamp = Date.now();
      const slug = `untitled-${timestamp}`;

      // 添加 ?new=true 参数来创建新页面
      router.push(`/page/${slug}?new=true`);
      // Don't close sidebar on desktop
      // onToggle is only called on mobile
    } catch (error) {
      console.error("创建页面时出错:", error);
      alert("创建页面失败，请重试");
    }
  };

  const isCurrentPage = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path.startsWith("/page/") && pathname === path) return true;
    return false;
  };

  // Organize pages into hierarchy
  const allPageEntries = Object.entries(pages);

  // Get parent pages (pages that are not marked as sub pages and not hidden from sidebar)
  const parentPages = allPageEntries
    .filter(([slug, page]) => {
      // 隐藏子页面
      if (page.isSubPage) return false;

      // 隐藏标记为不在侧边栏显示的页面
      if (page.hideFromSidebar) return false;

      return true;
    })
    .sort(([, a], [, b]) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Get sub pages grouped by parent (excluding pages hidden from sidebar)
  const subPagesByParent = allPageEntries
    .filter(([slug, page]) => {
      // 只显示标记为子页面且有父页面的页面
      if (!page.isSubPage || !page.parentSlug) return false;

      // 隐藏标记为不在侧边栏显示的页面
      if (page.hideFromSidebar) return false;

      return true;
    })
    .reduce(
      (acc, [slug, page]) => {
        const parentSlug = page.parentSlug!;
        if (!acc[parentSlug]) acc[parentSlug] = [];
        acc[parentSlug].push([slug, page]);
        return acc;
      },
      {} as Record<string, [string, PageData][]>,
    );

  // Sort sub pages by update time
  Object.keys(subPagesByParent).forEach((parentSlug) => {
    subPagesByParent[parentSlug].sort(
      ([, a], [, b]) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  });



  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
          onKeyDown={(e) => e.key === "Escape" && onToggle()}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`neo-sidebar
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-64 flex flex-col
      `}
      >
        {/* Header */}
        <div className="neo-header flex items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FuckNotion Logo"
              className="h-8 w-8 rounded-md object-cover"
            />
            <span className="neo-heading text-white">FUCKNOTION</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="neo-button lg:hidden text-white border-white hover:bg-white hover:text-black">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div id="sidebar-content" className="flex-1 overflow-y-auto p-4 space-y-3 bg-white" tabIndex={-1}>
          {/* Home */}
          <Link href="/">
            <Button
              variant="ghost"
              className={`neo-button w-full justify-start gap-3 ${
                isCurrentPage("/") ? "neo-button-primary" : ""
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="neo-text">主页</span>
            </Button>
          </Link>

          {/* Main Pages with Hierarchy */}
          <div className="space-y-1">
            {parentPages.map(([slug, page]) => {
              const hasSubPages = subPagesByParent[slug] && subPagesByParent[slug].length > 0;
              const isCollapsed = collapsedPages.has(slug);

              return (
                <div key={slug} className="space-y-1">
                  {/* Parent Page */}
                  <div className="neo-page-item group flex items-center justify-between px-2 py-2"
                  >
                    <div className="flex items-center flex-1">
                      {/* Collapse/Expand Button */}
                      {hasSubPages && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="neo-button h-6 w-6 p-0 mr-1 bg-transparent border-2 border-black"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePageCollapse(slug);
                          }}
                        >
                          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                      )}
                      {/* Page Link */}
                      <Link href={`/page/${slug}`} className="flex-1">
                        <Button
                          variant="ghost"
                          className={`neo-button w-full justify-start gap-3 ${hasSubPages ? "ml-0" : "ml-6"} ${
                            isCurrentPage(`/page/${slug}`) ? "neo-button-primary" : ""
                          } ${selectedPageSlug === slug ? "ring-4 ring-yellow-400" : ""} bg-transparent border-0`}
                          onClick={(e) => {
                            setSelectedPageSlug(slug);
                            // Ensure the sidebar content has focus for keyboard events
                            const sidebarElement = document.getElementById("sidebar-content");
                            if (sidebarElement) {
                              sidebarElement.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Delete" || e.key === "Backspace") {
                              e.preventDefault();
                              e.stopPropagation();
                              deletePage(slug, e);
                            }
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{page.title || "无标题"}</span>
                        </Button>
                      </Link>
                    </div>
                    <button
                      className="h-7 w-7 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      onClick={(e) => {
                        console.log("Delete button clicked for slug:", slug);
                        e.preventDefault();
                        e.stopPropagation();
                        deletePage(slug, e);
                      }}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Sub Pages */}
                  {hasSubPages && !isCollapsed && (
                    <div className="ml-8 space-y-2">
                      {subPagesByParent[slug].map(([subSlug, subPage]) => (
                        <div
                          key={subSlug}
                          className="neo-subpage-item group flex items-center justify-between px-2 py-1"
                        >
                          <Link href={`/page/${subSlug}`} className="flex-1">
                            <Button
                              variant="ghost"
                              className={`neo-button w-full justify-start gap-3 text-sm ${
                                isCurrentPage(`/page/${subSlug}`) ? "neo-button-success" : ""
                              } ${selectedPageSlug === subSlug ? "ring-4 ring-yellow-400" : ""} bg-transparent border-0`}
                              size="sm"
                              onClick={(e) => {
                                setSelectedPageSlug(subSlug);
                                // Ensure the sidebar content has focus for keyboard events
                                const sidebarElement = document.getElementById("sidebar-content");
                                if (sidebarElement) {
                                  sidebarElement.focus();
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Delete" || e.key === "Backspace") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  deletePage(subSlug, e);
                                }
                              }}
                            >
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-gray-400 rounded-full mr-1.5"></div>
                                <span className="truncate">{subPage.title || "无标题"}</span>
                              </div>
                            </Button>
                          </Link>
                          <button
                            className="h-6 w-6 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            onClick={(e) => {
                              console.log("Delete button clicked for subSlug:", subSlug);
                              e.preventDefault();
                              e.stopPropagation();
                              deletePage(subSlug, e);
                            }}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              variant="ghost"
              className="neo-button neo-button-success w-full justify-start gap-3 mt-4"
              onClick={createNewPage}
            >
              <Plus className="h-4 w-4" />
              <span className="neo-text">添加页面</span>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 space-y-2 transition-colors duration-300 ${
          backgroundImage 
            ? "border-t border-white/30 bg-white/50" 
            : "border-t border-gray-200"
        }`}>
          <Link href="/settings">
            <Button variant="ghost" className="neo-button w-full justify-start gap-3">
              <Settings className="h-4 w-4" />
              <span className="neo-text">设置</span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
