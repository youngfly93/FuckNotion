import React from "react";
import { FileText } from "lucide-react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

interface PageReferenceAttributes {
  pageId: string | null;
  slug: string;
  title: string;
}

// React component for page reference
const PageReferenceComponent = ({ node, updateAttributes }: NodeViewProps) => {
  const { slug, title } = node.attrs as PageReferenceAttributes;
  const [currentTitle, setCurrentTitle] = React.useState(title);
  const [pageExists, setPageExists] = React.useState(true);

  // Listen for page title updates
  React.useEffect(() => {
    const checkPageStatus = async () => {
      try {
        const { storageManager } = await import('@/lib/db/storage-manager');
        const page = await storageManager.getPage(slug);
        
        if (page && page.title !== currentTitle) {
          setCurrentTitle(page.title);
          updateAttributes({ title: page.title });
        } else if (!page) {
          // Fallback to localStorage
          const savedPages = localStorage.getItem("novel-pages");
          const pages = savedPages ? JSON.parse(savedPages) : {};
          
          if (pages[slug]) {
            setCurrentTitle(pages[slug].title);
            updateAttributes({ title: pages[slug].title });
          } else {
            setPageExists(false);
            setCurrentTitle("[已删除的页面]");
            updateAttributes({ title: "[已删除的页面]" });
          }
        }
      } catch (error) {
        console.error("Error checking page status:", error);
      }
    };

    // Check for updates periodically
    const interval = setInterval(checkPageStatus, 2000);

    // Also check when the page gains focus
    const handleFocus = () => checkPageStatus();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [slug, currentTitle, updateAttributes]);

  const handleClick = () => {
    // Don't allow clicking on deleted pages
    if (!pageExists) {
      alert("此页面已被删除");
      return;
    }
    // Navigate in the same window instead of opening new tab
    window.location.href = `/page/${slug}`;
  };

  const handleTitleUpdate = async (newTitle: string) => {
    setCurrentTitle(newTitle);
    updateAttributes({ title: newTitle });

    try {
      // Update title in IndexedDB
      const { storageManager } = await import('@/lib/db/storage-manager');
      const page = await storageManager.getPage(slug);
      
      if (page) {
        await storageManager.savePage(slug, {
          title: newTitle,
          content: page.content,
          parentSlug: page.parentSlug,
          isSubPage: page.isSubPage
        });
      }
    } catch (error) {
      console.error("Error updating title:", error);
      
      // Fallback to localStorage
      const savedPages = localStorage.getItem("novel-pages");
      const pages = savedPages ? JSON.parse(savedPages) : {};

      if (pages[slug]) {
        pages[slug].title = newTitle;
        pages[slug].updatedAt = new Date().toISOString();
        localStorage.setItem("novel-pages", JSON.stringify(pages));
      }
    }
  };

  const isDeleted = !pageExists;

  return (
    <NodeViewWrapper className="page-reference-wrapper">
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors my-1 mx-1 max-w-md ${
          isDeleted
            ? "border-red-200 bg-red-50 text-red-600 cursor-not-allowed"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
        }`}
        onClick={handleClick}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <FileText className={`h-4 w-4 flex-shrink-0 ${isDeleted ? "text-red-400" : "text-gray-600"}`} />
        <span
          className={`text-sm font-medium truncate ${isDeleted ? "text-red-600" : "text-gray-800"}`}
          contentEditable={!isDeleted}
          suppressContentEditableWarning={true}
          onBlur={(e: React.FocusEvent<HTMLSpanElement>) => {
            if (isDeleted) return;
            const newTitle = e.target.textContent?.trim() || "Untitled";
            if (newTitle !== currentTitle) {
              handleTitleUpdate(newTitle);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
            if (isDeleted) {
              e.preventDefault();
              return;
            }
            if (e.key === "Enter") {
              e.preventDefault();
              (e.target as HTMLElement).blur();
            }
            // Prevent the click handler from being triggered
            e.stopPropagation();
          }}
          onClick={(e) => {
            if (!isDeleted) {
              e.stopPropagation();
            }
          }}
        >
          {currentTitle || "Untitled"}
        </span>
      </div>
    </NodeViewWrapper>
  );
};

export const PageReference = Node.create({
  name: "pageReference",

  group: "inline",

  inline: true,

  selectable: true,

  addAttributes() {
    return {
      pageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-page-id"),
        renderHTML: (attributes) => {
          if (!attributes.pageId) return {};
          return { "data-page-id": attributes.pageId };
        },
      },
      slug: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-slug"),
        renderHTML: (attributes) => {
          if (!attributes.slug) return {};
          return { "data-slug": attributes.slug };
        },
      },
      title: {
        default: "Untitled",
        parseHTML: (element) => element.getAttribute("data-title") || "Untitled",
        renderHTML: (attributes) => {
          return { "data-title": attributes.title || "Untitled" };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="page-reference"]',
        getAttrs: (element) => {
          if (typeof element === "string") return false;
          return {
            pageId: element.getAttribute("data-page-id"),
            slug: element.getAttribute("data-slug"),
            title: element.getAttribute("data-title") || "Untitled",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "page-reference",
        "data-page-id": node.attrs.pageId,
        "data-slug": node.attrs.slug,
        "data-title": node.attrs.title,
      }),
      node.attrs.title || "Untitled",
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageReferenceComponent);
  },
});
