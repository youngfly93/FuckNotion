"use client";

import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import Sidebar from "@/components/sidebar";
import ExportMenu from "@/components/export-menu";
import { Menu, Settings, Share, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useBackground } from "@/contexts/background-context";
import { usePages } from "@/hooks/use-pages";

interface PageData {
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
  parentSlug?: string;
  isSubPage?: boolean;
  hideFromSidebar?: boolean;
}

export default function DynamicPageClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isCreateNew = searchParams.get('new') === 'true';

  // 使用 IndexedDB 存储
  const {
    pages,
    currentPage,
    isLoading: pagesLoading,
    error,
    savePage,
    loadPage
  } = usePages();

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);
  const [parentPage, setParentPage] = useState<PageData | null>(null);
  const [pageNotFound, setPageNotFound] = useState(false);
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const { backgroundImage } = useBackground();

  // Convert slug back to readable title (utility function, kept for future use)
  const _formatTitle = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // 使用 ref 来跟踪是否已经初始化，避免重复创建
  const isInitialized = useRef(false);
  const lastSlug = useRef(slug);

  // 当 slug 变化时，重置初始化状态
  if (lastSlug.current !== slug) {
    isInitialized.current = false;
    lastSlug.current = slug;
  }

  useEffect(() => {
    // 如果已经初始化，或者正在加载中，则跳过
    if (isInitialized.current) {
      return;
    }

    const loadPageData = async () => {
      try {
        // 标记为已初始化
        isInitialized.current = true;

        // 如果是创建新页面 (带有 ?new=true 参数)
        if (isCreateNew) {
          // 先尝试加载可能已经存在的页面（例如通过 "/" 斜杠命令提前创建的子页面）。
          const existing = await loadPage(slug);

          if (existing) {
            // 页面已存在，直接使用现有数据，避免覆盖 isSubPage / parentSlug 等属性
            setPageData({
              title: existing.title,
              content: existing.content,
              createdAt: existing.createdAt.toISOString(),
              updatedAt: existing.updatedAt.toISOString(),
              parentSlug: existing.parentSlug,
              isSubPage: existing.isSubPage,
              hideFromSidebar: existing.hideFromSidebar
            });
            setTitle(existing.title);

            // 如果是子页面，则加载父页面信息
            if (existing.parentSlug) {
              loadPage(existing.parentSlug).then(parent => {
                if (parent) {
                  setParentPage({
                    title: parent.title,
                    content: parent.content,
                    createdAt: parent.createdAt.toISOString(),
                    updatedAt: parent.updatedAt.toISOString(),
                    parentSlug: parent.parentSlug,
                    isSubPage: parent.isSubPage
                  });
                }
              });
            }

            // 移除 URL 参数
            router.replace(`/page/${slug}`);
            return;
          }

          // 页面不存在，创建一个新的顶级页面
          setIsLoading(false);

          const newPageData = {
            title: "Untitled",
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '' }]
                }
              ]
            }
          };

          await savePage(slug, {
            ...newPageData,
            isSubPage: false,
            hideFromSidebar: false
          });

          setPageData({
            ...newPageData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          setTitle(newPageData.title);
          setIsNewPage(true);

          // 移除 URL 参数
          router.replace(`/page/${slug}`);
          return;
        }

        setIsLoading(true);

        // 尝试从 IndexedDB 加载页面
        const page = await loadPage(slug);

        if (page) {
          // 页面存在，加载数据
          setPageData({
            title: page.title,
            content: page.content,
            createdAt: page.createdAt.toISOString(),
            updatedAt: page.updatedAt.toISOString(),
            parentSlug: page.parentSlug,
            isSubPage: page.isSubPage
          });
          setTitle(page.title);

          // 加载父页面数据
          if (page.parentSlug) {
            // 从 IndexedDB 加载父页面
            loadPage(page.parentSlug).then(parent => {
              if (parent) {
                setParentPage({
                  title: parent.title,
                  content: parent.content,
                  createdAt: parent.createdAt.toISOString(),
                  updatedAt: parent.updatedAt.toISOString(),
                  parentSlug: parent.parentSlug,
                  isSubPage: parent.isSubPage
                });
              }
            });
          }
        } else {
          // 检查是否应该创建新页面
          if (isCreateNew) {
            // 创建新页面
            const newPageData = {
              title: "Untitled",
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '' }]
                  }
                ]
              }
            };

            await savePage(slug, {
              ...newPageData,
              isSubPage: false,
              hideFromSidebar: false
            });
            setPageData({
              ...newPageData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setTitle(newPageData.title);
            setIsNewPage(true);

            // 移除 URL 参数
            router.replace(`/page/${slug}`);
          } else {
            // 页面不存在，显示 404
            setPageNotFound(true);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading page:', error);
        // Fallback 到 localStorage
        const savedPages = localStorage.getItem("novel-pages");
        const legacyPages = savedPages ? JSON.parse(savedPages) : {};

        if (legacyPages[slug]) {
          setPageData(legacyPages[slug]);
          setTitle(legacyPages[slug].title);
        } else {
          // 检查是否应该创建新页面
          if (isCreateNew) {
            // 创建新页面
            const newPageData = {
              title: "Untitled",
              content: {
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: '' }]
                  }
                ]
              }
            };

            await savePage(slug, newPageData);
            setPageData({
              ...newPageData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            setTitle(newPageData.title);
            setIsNewPage(true);

            // 移除 URL 参数
            router.replace(`/page/${slug}`);
          } else {
            // 页面不存在，显示 404
            setPageNotFound(true);
            return;
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [slug, loadPage, savePage, isCreateNew, router]); // 移除 pages 依赖以避免循环

  // 清理 timer
  useEffect(() => {
    return () => {
      if (titleDebounceTimer.current) {
        clearTimeout(titleDebounceTimer.current);
      }
    };
  }, []);

  const savePageData = async (content: any) => {
    if (!pageData) return;

    try {
      // 保存到 IndexedDB
      await savePage(slug, {
        title: pageData.title,
        content,
        parentSlug: pageData.parentSlug,
        isSubPage: pageData.isSubPage,
        hideFromSidebar: pageData.hideFromSidebar
      });

      // 更新本地状态
      const updatedPageData = {
        ...pageData,
        content,
        updatedAt: new Date().toISOString(),
      };
      setPageData(updatedPageData);
    } catch (error) {
      console.error('Error saving page to IndexedDB:', error);

      // Fallback 到 localStorage
      const savedPages = localStorage.getItem("novel-pages");
      const pages = savedPages ? JSON.parse(savedPages) : {};

      pages[slug] = {
        ...pageData,
        content,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("novel-pages", JSON.stringify(pages));
      setPageData(pages[slug]);
    }
  };

  // 使用 useRef 来存储 debounce timer
  const titleDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 保存标题的函数
  const saveTitleToDb = useCallback(async (newTitle: string) => {
    if (!pageData) return;
    
    try {
      // 保存到 IndexedDB
      await savePage(slug, {
        title: newTitle,
        content: pageData.content,
        parentSlug: pageData.parentSlug,
        isSubPage: pageData.isSubPage
      });
    } catch (error) {
      console.error('Error saving title to IndexedDB:', error);

      // Fallback 到 localStorage
      const savedPages = localStorage.getItem("novel-pages");
      const pages = savedPages ? JSON.parse(savedPages) : {};

      pages[slug] = {
        ...pageData,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("novel-pages", JSON.stringify(pages));
    }
  }, [pageData, savePage, slug]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    
    if (pageData) {
      // 更新本地状态立即
      const updatedPageData = {
        ...pageData,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      };
      setPageData(updatedPageData);

      // 清除之前的 timer
      if (titleDebounceTimer.current) {
        clearTimeout(titleDebounceTimer.current);
      }

      // 设置新的 timer，延迟保存到数据库
      titleDebounceTimer.current = setTimeout(() => {
        saveTitleToDb(newTitle);
      }, 500); // 500ms 延迟
    }
  }, [pageData, saveTitleToDb]);

  if (isLoading) {
    return (
      <div className="neo-container flex min-h-screen items-center justify-center">
        <div className="neo-spinner"></div>
      </div>
    );
  }

  // 显示 404 页面
  if (pageNotFound) {
    return (
      <div className="neo-container flex min-h-screen items-center justify-center">
        <div className="neo-card text-center p-12">
          <h1 className="neo-heading text-8xl mb-6 text-red-500">404</h1>
          <p className="neo-text text-2xl mb-6">页面不存在</p>
          <p className="neo-text text-lg mb-8">您访问的页面可能已被删除或从未存在。</p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button className="neo-button neo-button-primary">
                <span className="neo-text">返回首页</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="neo-button"
            >
              <span className="neo-text">返回上一页</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-container flex min-h-screen"
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}
      >
        {/* Header */}
        <div className="neo-header flex flex-col w-full gap-2 mb-4 px-4 py-3"
        >
          {/* Top row with menu and actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={toggleSidebar}
              className="neo-button-primary h-12 w-12 p-0 bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150"
            >
              <Menu className="h-6 w-6 font-bold text-black" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <ExportMenu title={title} content={pageData?.content} pageSlug={slug} />
              <Button variant="ghost" size="sm" className="neo-button gap-2 text-white border-white hover:bg-white hover:text-black">
                <Share className="h-4 w-4" />
                <span className="neo-text">Share</span>
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="neo-button gap-2 text-white border-white hover:bg-white hover:text-black">
                  <Settings className="h-4 w-4" />
                  <span className="neo-text">Settings</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Breadcrumb navigation for sub pages */}
          {pageData?.isSubPage && parentPage && (
            <div className="flex items-center gap-2 text-sm text-white mb-2">
              <Link
                href={pageData.parentSlug ? `/page/${pageData.parentSlug}` : "/"}
                className="neo-text neo-text-white hover:text-yellow-400 transition-colors font-bold"
              >
                {parentPage.title || "Untitled"}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="neo-text text-yellow-400 font-bold">{title || "Untitled"}</span>
            </div>
          )}

          {/* Title input - centered */}
          <div className="flex justify-center w-full py-4">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="neo-heading neo-heading-white text-3xl bg-transparent border-none outline-none text-center placeholder-gray-300 max-w-2xl w-full font-black"
              placeholder="UNTITLED PAGE"
              autoFocus={isNewPage}
              style={{ color: 'white !important' }}
            />
          </div>
        </div>

        {/* Editor */}
        {pageData && (
          <TailwindAdvancedEditor
            initialContent={pageData.content}
            onUpdate={savePageData}
            pageTitle={title}
            darkMode={false}
          />
        )}
      </div>
    </div>
  );
}
