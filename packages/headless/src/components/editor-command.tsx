import { useAtom, useSetAtom } from "jotai";
import { useEffect, forwardRef, createContext, useImperativeHandle } from "react";
import { Command } from "cmdk";
import { queryAtom, rangeAtom } from "../utils/atoms";
import { novelStore } from "../utils/store";
import type tunnel from "tunnel-rat";
import type { ComponentPropsWithoutRef, FC } from "react";
import type { Range } from "@tiptap/core";

export const EditorCommandTunnelContext = createContext({} as ReturnType<typeof tunnel>);

interface EditorCommandOutProps {
  readonly query: string;
  readonly range: Range;
}

export const EditorCommandOut = forwardRef<{ onKeyDown: (props: { event: KeyboardEvent }) => boolean }, EditorCommandOutProps>(
  ({ query, range }, ref) => {
    const setQuery = useSetAtom(queryAtom, { store: novelStore });
    const setRange = useSetAtom(rangeAtom, { store: novelStore });

    useEffect(() => {
      setQuery(query);
    }, [query, setQuery]);

    useEffect(() => {
      setRange(range);
    }, [range, setRange]);

    // Expose onKeyDown method to the parent via ref
    useImperativeHandle(ref, () => ({
      onKeyDown: (props: { event: KeyboardEvent }) => {
        const { event } = props;
        
        if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
          const commandRef = document.querySelector("#slash-command");
          
          if (commandRef && getComputedStyle(commandRef).display !== 'none') {
            event.preventDefault();
            event.stopPropagation();
            
            // Find the hidden input and dispatch event to it
            const hiddenInput = commandRef.querySelector('[cmdk-input]') as HTMLInputElement;
            if (hiddenInput) {
              hiddenInput.focus();
              const keyEvent = new KeyboardEvent('keydown', {
                key: event.key,
                bubbles: true,
                cancelable: true
              });
              hiddenInput.dispatchEvent(keyEvent);
              return true; // Handled
            }
          }
        }
        
        return false; // Not handled
      }
    }), []);

    return (
      <EditorCommandTunnelContext.Consumer>
        {(tunnelInstance) => <tunnelInstance.Out />}
      </EditorCommandTunnelContext.Consumer>
    );
  }
);

export const EditorCommand = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<typeof Command>>(
  ({ children, className, ...rest }, ref) => {
    const [query, setQuery] = useAtom(queryAtom);

    return (
      <EditorCommandTunnelContext.Consumer>
        {(tunnelInstance) => (
          <tunnelInstance.In>
            <Command
              ref={ref}
              loop
              tabIndex={0}
              onKeyDown={(e) => {
                // Allow navigation keys to work within the command menu
                // Only stop propagation for non-navigation keys  
                if (!["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.key)) {
                  e.stopPropagation();
                }
              }}
              id="slash-command"
              className={className}
              {...rest}
            >
              <Command.Input value={query} onValueChange={setQuery} style={{ display: "none" }} />
              {children}
            </Command>
          </tunnelInstance.In>
        )}
      </EditorCommandTunnelContext.Consumer>
    );
  },
);
export const EditorCommandList = Command.List;

EditorCommand.displayName = "EditorCommand";
