import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const DirectTableDragKey = new PluginKey('directTableDrag');

export const DirectTableDrag = Extension.create({
  name: 'directTableDrag',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: DirectTableDragKey,
        props: {
          handleDOMEvents: {
            // 禁用默认拖拽
            dragstart(view, event) {
              const target = event.target as HTMLElement;
              const cell = target.closest('td, th');
              if (cell) {
                event.preventDefault();
                return true;
              }
              return false;
            },

            mousedown(view, event) {
              const target = event.target as HTMLElement;
              const cell = target.closest('td, th') as HTMLElement;

              if (!cell) {
                return false;
              }

              console.log('Mouse down on table cell:', cell);

              // 添加拖拽样式
              cell.classList.add('dragging-cell');

              const table = cell.closest('table');
              if (!table) {
                cell.classList.remove('dragging-cell');
                return false;
              }

              const cells = Array.from(table.querySelectorAll('td, th')) as HTMLElement[];

              // 创建拖拽指示器
              const indicator = document.createElement('div');
              indicator.className = 'drag-indicator';
              indicator.style.cssText = `
                position: absolute;
                z-index: 1000;
                background: rgba(59, 130, 246, 0.3);
                border: 2px solid #3b82f6;
                border-radius: 4px;
                pointer-events: none;
                display: none;
              `;
              document.body.appendChild(indicator);

              const handleMouseMove = (e: MouseEvent) => {
                const targetCell = document.elementFromPoint(e.clientX, e.clientY)?.closest('td, th') as HTMLElement;

                if (targetCell && cells.includes(targetCell) && targetCell !== cell) {
                  const rect = targetCell.getBoundingClientRect();
                  indicator.style.width = `${rect.width}px`;
                  indicator.style.height = `${rect.height}px`;
                  indicator.style.left = `${rect.left}px`;
                  indicator.style.top = `${rect.top}px`;
                  indicator.style.display = 'block';
                  targetCell.style.background = 'rgba(59, 130, 246, 0.1)';
                  
                  // 清除其他单元格的高亮
                  cells.forEach(c => {
                    if (c !== targetCell && c !== cell) {
                      c.style.background = '';
                    }
                  });
                } else {
                  indicator.style.display = 'none';
                  cells.forEach(c => {
                    if (c !== cell) {
                      c.style.background = '';
                    }
                  });
                }
              };

              const handleMouseUp = (e: MouseEvent) => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);

                cell.classList.remove('dragging-cell');
                indicator.remove();

                // 清除所有高亮
                cells.forEach(c => {
                  c.style.background = '';
                });

                const targetCell = document.elementFromPoint(e.clientX, e.clientY)?.closest('td, th') as HTMLElement;

                if (targetCell && cells.includes(targetCell) && targetCell !== cell) {
                  console.log('Swapping cells:', cell, targetCell);
                  
                  // 交换单元格内容
                  const sourceText = cell.textContent || '';
                  const targetText = targetCell.textContent || '';
                  
                  cell.textContent = targetText;
                  targetCell.textContent = sourceText;
                  
                  // 显示成功提示
                  const toast = document.createElement('div');
                  toast.textContent = '✅ 单元格内容已交换';
                  toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                  `;
                  document.body.appendChild(toast);
                  
                  setTimeout(() => {
                    toast.remove();
                  }, 2000);
                }
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);

              return true;
            },
          },
        },
      }),
    ];
  },
});

// 添加简单样式
const addDirectTableStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'direct-table-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .ProseMirror td, .ProseMirror th {
      position: relative;
      cursor: move;
      transition: all 0.2s ease;
    }
    
    .ProseMirror td:hover, .ProseMirror th:hover {
      background-color: rgba(59, 130, 246, 0.1);
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
    }
    
    .ProseMirror td.dragging-cell, .ProseMirror th.dragging-cell {
      opacity: 0.7;
      background-color: rgba(59, 130, 246, 0.2) !important;
      transform: scale(0.98);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .ProseMirror td:hover::after, .ProseMirror th:hover::after {
      content: "直接拖拽交换单元格";
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      opacity: 0.8;
      pointer-events: none;
      z-index: 100;
    }
  `;
  
  document.head.appendChild(style);
};

if (typeof window !== 'undefined') {
  addDirectTableStyles();
}

export default DirectTableDrag;
