"use client";

import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import { Button } from "@/components/tailwind/ui/button";
import Sidebar from "@/components/sidebar";
import ExportMenu from "@/components/export-menu";
import { Menu, Settings, Share, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebar } from "@/contexts/sidebar-context";
import { useBackground } from "@/contexts/background-context";

interface PageData {
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
  parentSlug?: string;
  isSubPage?: boolean;
}

export default function DynamicPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("Untitled");
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [isNewPage, setIsNewPage] = useState(false);
  const [parentPage, setParentPage] = useState<PageData | null>(null);
  const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebar();
  const { backgroundImage } = useBackground();

  // Convert slug back to readable title (utility function, kept for future use)
  const _formatTitle = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    // Load page data from localStorage immediately
    const savedPages = localStorage.getItem("novel-pages");
    const pages = savedPages ? JSON.parse(savedPages) : {};

    if (pages[slug]) {
      // Page exists, load it
      const currentPageData = pages[slug];
      setPageData(currentPageData);
      setTitle(currentPageData.title);

      // Load parent page data if this is a sub page
      if (currentPageData.parentSlug && pages[currentPageData.parentSlug]) {
        setParentPage(pages[currentPageData.parentSlug]);
      }
    } else {
      // Create new page immediately
      const newPage: PageData = {
        title: "Untitled",
        content: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      pages[slug] = newPage;
      localStorage.setItem("novel-pages", JSON.stringify(pages));
      setPageData(newPage);
      setTitle(newPage.title);
    }

    setIsLoading(false);
  }, [slug]);

  const savePageData = (content: any) => {
    if (!pageData) return;

    const savedPages = localStorage.getItem("novel-pages");
    const pages = savedPages ? JSON.parse(savedPages) : {};

    pages[slug] = {
      ...pageData,
      content,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("novel-pages", JSON.stringify(pages));
    setPageData(pages[slug]);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (pageData) {
      const savedPages = localStorage.getItem("novel-pages");
      const pages = savedPages ? JSON.parse(savedPages) : {};

      pages[slug] = {
        ...pageData,
        title: newTitle,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("novel-pages", JSON.stringify(pages));
      setPageData(pages[slug]);
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
        {/* Header */}
        <div className={`flex flex-col w-full max-w-4xl gap-1 mb-1 ${sidebarOpen ? "px-4" : "px-4 sm:px-5"}`}>
          {/* Top row with menu and actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleSidebar} className="gap-2">
              <Menu className="h-4 w-4" />
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <ExportMenu title={title} content={pageData?.content} pageSlug={slug} />
              <Button variant="ghost" size="sm" className="gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Breadcrumb navigation for sub pages */}
          {pageData?.isSubPage && parentPage && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link
                href={pageData.parentSlug ? `/page/${pageData.parentSlug}` : "/"}
                className="hover:text-gray-900 transition-colors"
              >
                {parentPage.title || "Untitled"}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900">{title || "Untitled"}</span>
            </div>
          )}

          {/* Title input - centered */}
          <div className="flex justify-center w-full py-4">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-3xl font-bold bg-transparent border-none outline-none text-center placeholder-gray-400 max-w-2xl w-full"
              placeholder="Untitled Page"
            />
          </div>
        </div>

        {/* Editor */}
        <TailwindAdvancedEditor
          initialContent={pageData?.content}
          onUpdate={savePageData}
          pageTitle={title}
          darkMode={false}
        />
      </div>
    </div>
  );
}
