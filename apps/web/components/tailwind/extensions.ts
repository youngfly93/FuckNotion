import {
  AIHighlight,
  AutoComplete,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  MarkdownExtension,
  Mathematics,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapImage,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UpdatedImage,
  UploadImagesPlugin,
  Youtube,
} from "novel";

import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import { PageReference } from "./page-reference-extension";

//TODO I am using cx here to get tailwind autocomplete working, idk if someone else can write a regex to just capture the class key in objects
const aiHighlight = AIHighlight;
//You can overwrite the placeholder with your own configuration
const placeholder = Placeholder;
const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2 "),
  },
});
const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  paragraph: {
    HTMLAttributes: {
      class: cx("mb-1"), // Reduced spacing between paragraphs for tighter layout
    },
  },
  heading: {
    HTMLAttributes: {
      class: cx("mt-6 mb-4"), // Add spacing around headings
    },
  },
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 mb-4"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 mb-4"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal mb-1"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary mb-4 pl-4"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium mb-4"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  // configure lowlight: common /  all / use highlightJS in case there is a need to specify certain language grammars only
  // common: covers 37 language grammars which should be good enough in most cases
  lowlight: createLowlight(common),
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx("not-prose"),
  },
  inline: false,
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

// Custom function to fix markdown heading format
const fixMarkdownHeadings = (text: string): string => {
  // Fix headings that don't have space after #
  return text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');
};

const markdownExtension = MarkdownExtension.configure({
  html: true,
  tightLists: true,
  tightListClass: "tight",
  bulletListMarker: "-",
  linkify: false,
  breaks: false,
  transformCopiedText: false,
  transformPastedText: false,
});

// Load autocomplete settings from localStorage with defaults
const loadAutoCompleteSettings = () => {
  if (typeof window === "undefined") {
    return { delay: 20, minLength: 3, maxTokens: 150 };
  }
  try {
    const saved = localStorage.getItem("novel-api-config");
    if (saved) {
      const config = JSON.parse(saved);
      return {
        delay: config.delay || 20,
        minLength: config.minLength || 3,
        maxTokens: config.maxTokens || 150,
      };
    }
  } catch (error) {
    console.error("Failed to load autocomplete settings:", error);
  }
  return { delay: 20, minLength: 3, maxTokens: 150 };
};

const autoCompleteSettings = loadAutoCompleteSettings();

const autoComplete = AutoComplete.configure({
  delay: autoCompleteSettings.delay,
  minLength: autoCompleteSettings.minLength,
  maxTokens: autoCompleteSettings.maxTokens,
});

// Configure Table extensions with proper styling
const table = Table.configure({
  resizable: true,
  HTMLAttributes: {
    class: "border-collapse table-auto w-full border border-gray-300",
  },
});

const tableRow = TableRow.configure({
  HTMLAttributes: {
    class: "border-b border-gray-300",
  },
});

const tableHeader = TableHeader.configure({
  HTMLAttributes: {
    class: "border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold",
  },
});

const tableCell = TableCell.configure({
  HTMLAttributes: {
    class: "border border-gray-300 px-4 py-2",
  },
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  markdownExtension,
  HighlightExtension,
  TextStyle,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  PageReference,
  autoComplete,
  table,
  tableRow,
  tableHeader,
  tableCell,
];
