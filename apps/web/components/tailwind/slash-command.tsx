import {
  CheckSquare,
  Code,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  MessageSquarePlus,
  Table,
  Text,
  TextQuote,
  Twitter,
  Youtube,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "novel";
import { uploadFn } from "./image-upload";

export const suggestionItems = createSuggestionItems([
  {
    title: "Page",
    description: "Create a new page.",
    searchTerms: ["page", "new page", "document", "subpage"],
    icon: <FileText size={18} />,
    command: ({ editor, range }) => {
      // Generate unique page ID
      const pageId = `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const slug = pageId;

      // Create page reference in current editor first
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "pageReference",
          attrs: {
            pageId: pageId,
            slug: slug,
            title: "Untitled",
          },
        })
        .run();

      // Force save the current editor content to ensure page reference is persisted
      // This prevents the page reference from being lost when navigating away quickly
      setTimeout(() => {
        // Trigger editor save by dispatching a manual save
        const saveEvent = new CustomEvent("forceSave");
        window.dispatchEvent(saveEvent);
      }, 100);

      // Get current page slug from URL to set as parent
      const currentPath = window.location.pathname;
      const pathParts = currentPath.split("/page/");
      const currentSlug = pathParts.length > 1 ? pathParts[1].split("?")[0] : null; // Remove query params



      // Only mark as sub page if we have a valid parent (i.e., created from another page, not from home)
      const isSubPage = currentSlug !== null;
      

      // Create page data using IndexedDB through storage manager
      const createSubPage = async () => {
        try {
          // Import storage manager
          const { storageManager } = await import('@/lib/db/storage-manager');
          
          // Create the new page in IndexedDB
          await storageManager.savePage(slug, {
            title: "Untitled",
            content: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: '' }]
                }
              ]
            },
            parentSlug: isSubPage ? currentSlug : undefined,
            isSubPage: isSubPage,
            hideFromSidebar: false
          });

        } catch (error) {
          console.error("Error creating sub page:", error);
          
          // Fallback to localStorage
          const savedPages = localStorage.getItem("novel-pages");
          const pages = savedPages ? JSON.parse(savedPages) : {};
          
          pages[slug] = {
            title: "Untitled",
            content: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            parentSlug: isSubPage ? currentSlug : undefined,
            isSubPage: isSubPage,
            hideFromSidebar: false
          };
          
          localStorage.setItem("novel-pages", JSON.stringify(pages));
        }
      };

      // Create the page and then navigate
      createSubPage().then(() => {
        // Add a small delay to ensure the page reference is properly saved in the editor
        setTimeout(() => {
          // Trigger another save to ensure the parent page has the reference
          const saveEvent = new CustomEvent("forceSave");
          window.dispatchEvent(saveEvent);
          
          // Navigate to the new page after ensuring everything is saved
          setTimeout(() => {
            window.location.href = `/page/${slug}?new=true`;
          }, 500);
        }, 300);
      }).catch(error => {
        console.error("Failed to create sub page:", error);
        alert("创建子页面失败，请重试");
      });
    },
  },
  {
    title: "Send Feedback",
    description: "Let us know how we can improve.",
    icon: <MessageSquarePlus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      window.open("/feedback", "_blank");
    },
  },
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Create a table.",
    searchTerms: ["table", "grid", "data"],
    icon: <Table size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFn(file, editor.view, pos);
        }
      };
      input.click();
    },
  },
  {
    title: "Youtube",
    description: "Embed a Youtube video.",
    searchTerms: ["video", "youtube", "embed"],
    icon: <Youtube size={18} />,
    command: ({ editor, range }) => {
      const videoLink = prompt("Please enter Youtube Video Link");
      //From https://regexr.com/3dj5t
      const ytregex = new RegExp(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/,
      );

      if (ytregex.test(videoLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({
            src: videoLink,
          })
          .run();
      } else {
        if (videoLink !== null) {
          alert("Please enter a correct Youtube Video Link");
        }
      }
    },
  },
  {
    title: "Twitter",
    description: "Embed a Tweet.",
    searchTerms: ["twitter", "embed"],
    icon: <Twitter size={18} />,
    command: ({ editor, range }) => {
      const tweetLink = prompt("Please enter Twitter Link");
      const tweetRegex = new RegExp(/^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/);

      if (tweetRegex.test(tweetLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setTweet({
            src: tweetLink,
          })
          .run();
      } else {
        if (tweetLink !== null) {
          alert("Please enter a correct Twitter Link");
        }
      }
    },
  },
]);

export const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
