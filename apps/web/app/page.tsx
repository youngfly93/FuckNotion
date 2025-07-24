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
      <div className="neo-container flex min-h-screen items-center justify-center">
        <div className="neo-spinner"></div>
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
        <div className="neo-header flex w-full items-center gap-2 mb-4 px-4 py-3"
        >
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="neo-button gap-2 text-white border-white hover:bg-white hover:text-black">
            <Menu className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="FuckNotion Logo"
              className="h-6 w-6 rounded-md object-cover"
            />
            <span className="neo-heading neo-heading-white">FUCKNOTION</span>
          </div>

          <Button size="icon" variant="outline" className="neo-button ml-auto text-white border-white hover:bg-white hover:text-black">
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
