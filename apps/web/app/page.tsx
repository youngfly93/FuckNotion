"use client";

import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import Sidebar from "@/components/sidebar";
import { Menu, GithubIcon } from "lucide-react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useBackground } from "@/contexts/background-context";
import { usePages } from "@/hooks/use-pages";
import { useEffect, useState } from "react";

// 确保这是根路由页面
export default function HomePage() {
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const { backgroundImage } = useBackground();

  // 使用 IndexedDB 存储
  const { savePage, loadPage } = usePages();
  const [initialContent, setInitialContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载主页内容
  useEffect(() => {
    const loadMainPageContent = async () => {
      try {
        const page = await loadPage('main-page');
        if (page) {
          setInitialContent(page.content);
        }
      } catch (error) {
        console.error('Error loading main page:', error);
        // Fallback 到 localStorage
        const savedContent = localStorage.getItem('novel-content');
        if (savedContent) {
          setInitialContent(JSON.parse(savedContent));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadMainPageContent();
  }, [loadPage]);

  // 保存主页内容
  const handleContentUpdate = async (content: any) => {
    try {
      await savePage('main-page', {
        title: 'Main Page',
        content
      });
    } catch (error) {
      console.error('Error saving main page:', error);
      // Fallback 到 localStorage
      localStorage.setItem('novel-content', JSON.stringify(content));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${!backgroundImage ? "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" : ""}`}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col items-center gap-1 py-2 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}
      >
        <div className={`flex w-full max-w-4xl items-center gap-2 mb-1 ${sidebarOpen ? "px-4" : "px-4 sm:px-5"}`}>
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="gap-2">
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FuckNotion Logo"
              className="h-6 w-6 rounded-md object-cover"
            />
            <span className="font-semibold text-gray-900">FuckNotion</span>
          </div>

          <Button size="icon" variant="outline" className="ml-auto">
            <a href="https://github.com/youngfly93/FuckNotion" target="_blank" rel="noreferrer">
              <GithubIcon />
            </a>
          </Button>
        </div>

        <TailwindAdvancedEditor
          initialContent={initialContent}
          onUpdate={handleContentUpdate}
        />
      </div>
    </div>
  );
}
