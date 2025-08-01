import { InputRule } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import TiptapUnderline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import CustomKeymap from "./custom-keymap";
import { ImageResizer } from "./image-resizer";
import { Twitter } from "./twitter";
import { Mathematics } from "./mathematics";
import UpdatedImage from "./updated-image";
import { AutoComplete } from "./auto-complete";

import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";

const PlaceholderExtension = Placeholder.configure({
  placeholder: ({ node, editor }) => {
    // Only show placeholder for the first paragraph in an empty document
    const { doc } = editor.state;
    const isEmptyDoc = doc.content.size <= 4; // Empty doc has minimal size
    const isFirstNode = editor.state.selection.$anchor.pos <= 2;
    
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`;
    }
    
    // Only show slash command hint for the first paragraph in empty documents
    if (node.type.name === "paragraph" && isEmptyDoc && isFirstNode) {
      return "Press '/' for commands";
    }
    
    return "";
  },
  includeChildren: false, // Don't show placeholder for child nodes
});

const HighlightExtension = Highlight.configure({
  multicolor: true,
});

const MarkdownExtension = Markdown.configure({
  html: false,
  transformCopiedText: true,
});

const Horizontal = HorizontalRule.extend({
  addInputRules() {
    return [
      new InputRule({
        find: /^(?:---|—-|___\s|\*\*\*\s)$/u,
        handler: ({ state, range }) => {
          const attributes = {};

          const { tr } = state;
          const start = range.from;
          const end = range.to;

          tr.insert(start - 1, this.type.create(attributes)).delete(tr.mapping.map(start), tr.mapping.map(end));
        },
      }),
    ];
  },
});

export * from "./ai-highlight";
export * from "./slash-command";
export {
  CodeBlockLowlight,
  Horizontal as HorizontalRule,
  ImageResizer,
  InputRule,
  PlaceholderExtension as Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapUnderline,
  MarkdownExtension,
  TextStyle,
  Color,
  HighlightExtension,
  CustomKeymap,
  TiptapLink,
  UpdatedImage,
  Youtube,
  Twitter,
  Mathematics,
  CharacterCount,
  GlobalDragHandle,
  AutoComplete,
};
