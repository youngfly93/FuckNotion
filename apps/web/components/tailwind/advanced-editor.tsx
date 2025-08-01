"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";
import { EnhancedDragHandle, DragHandleMenuComponent } from "./enhanced-drag-handle";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";

const hljs = require("highlight.js");

// Keep original GlobalDragHandle and add our enhanced version alongside
const extensions = [...defaultExtensions, slashCommand, EnhancedDragHandle];

interface TailwindAdvancedEditorProps {
  initialContent?: JSONContent | null;
  onUpdate?: (content: JSONContent) => void;
  pageTitle?: string;
  darkMode?: boolean;
}

const TailwindAdvancedEditor = ({
  initialContent: propInitialContent,
  onUpdate: propOnUpdate,
  darkMode = false,
}: TailwindAdvancedEditorProps = {}) => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(null);

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-ignore
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const saveContent = useCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();

      if (propOnUpdate) {
        // Use custom update handler for page-specific content
        propOnUpdate(json);
      } else {
        // Default behavior for main editor
        window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
        window.localStorage.setItem("novel-content", JSON.stringify(json));
        window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
      }
    },
    [propOnUpdate],
  );

  const debouncedUpdates = useDebouncedCallback(saveContent, 500);

  // Store editor instance ref for force save
  const editorRef = useRef<EditorInstance | null>(null);

  // Listen for force save events from page creation
  useEffect(() => {
    const handleForceSave = () => {
      if (editorRef.current) {
        saveContent(editorRef.current);
      }
    };

    window.addEventListener("forceSave", handleForceSave);
    return () => {
      window.removeEventListener("forceSave", handleForceSave);
    };
  }, [saveContent]);

  useEffect(() => {
    if (propInitialContent !== undefined) {
      // Use provided initial content
      if (propInitialContent === null) {
        // For null initial content (new pages), use empty content
        setInitialContent({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [],
            },
          ],
        });
      } else {
        setInitialContent(propInitialContent);
      }
    } else {
      // Default behavior - load from localStorage
      const content = window.localStorage.getItem("novel-content");
      if (content) setInitialContent(JSON.parse(content));
      else setInitialContent(defaultEditorContent);
    }
  }, [propInitialContent]);

  if (!initialContent) return null;

  return (
    <div className={`neo-card relative w-full max-w-4xl mx-auto ${darkMode ? "dark" : ""}`}>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className={`editor-a4-layout ${darkMode ? "dark" : ""} relative border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
          immediatelyRender={false}
          editorProps={{
            handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class: darkMode
                ? "prose prose-lg prose-invert prose-headings:font-title font-default focus:outline-none max-w-none text-white"
                : "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-none",
            },
          }}
          onUpdate={({ editor }) => {
            editorRef.current = editor;
            debouncedUpdates(editor);
          }}
          slotAfter={
            <>
              <ImageResizer />
              {editorRef.current && <DragHandleMenuComponent editor={editorRef.current} />}
            </>
          }
        >
          <EditorCommand
            className="neo-slash-command-menu z-50 h-auto max-h-[330px] overflow-y-auto px-4 py-4 transition-all bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            defaultValue={suggestionItems[0]?.title}
          >
            <EditorCommandEmpty className="px-2 text-gray-600 font-bold">No results</EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command(val)}
                  className="neo-slash-command-item flex w-full items-center space-x-3 px-3 py-3 text-left text-sm mb-2 last:mb-0 bg-gray-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 cursor-pointer"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-black">{item.title}</p>
                    <p className="text-xs text-gray-700 font-medium">{item.description}</p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
