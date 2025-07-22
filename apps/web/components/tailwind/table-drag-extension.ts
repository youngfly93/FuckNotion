import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const TableDragPluginKey = new PluginKey('tableDrag');

export const TableDragExtension = Extension.create({
  name: 'tableDrag',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: TableDragPluginKey,
        props: {
          handleDOMEvents: {
            // 禁用表格内容的默认拖拽
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

              // 简化：只要按住 Shift 键就可以拖拽
              if (!event.shiftKey) {
                return false;
              }

              console.log('Table drag started!', cell); // 调试日志

              event.preventDefault();
              event.stopPropagation();

              // 添加拖拽样式
              cell.classList.add('dragging-cell');
              cell.style.cursor = 'move';

              // 获取表格和所有单元格
              const table = cell.closest('table');
              if (!table) {
                cell.classList.remove('dragging-cell');
                return false;
              }

              const cells = Array.from(table.querySelectorAll('td, th')) as HTMLElement[];

              // 创建拖拽指示器
              const indicator = document.createElement('div');
              indicator.className = 'table-drag-indicator';
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

              // 创建拖拽预览
              const preview = cell.cloneNode(true) as HTMLElement;
              preview.style.cssText = `
                position: absolute;
                z-index: 999;
                opacity: 0.8;
                pointer-events: none;
                background: white;
                border: 1px solid #3b82f6;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: rotate(5deg);
              `;
              document.body.appendChild(preview);

              const handleMouseMove = (e: MouseEvent) => {
                // 更新预览位置
                preview.style.left = `${e.clientX + 10}px`;
                preview.style.top = `${e.clientY + 10}px`;

                // 查找目标单元格
                const targetCell = document.elementFromPoint(e.clientX, e.clientY)?.closest('td, th') as HTMLElement;

                if (targetCell && cells.includes(targetCell) && targetCell !== cell) {
                  const targetRect = targetCell.getBoundingClientRect();
                  indicator.style.cssText += `
                    width: ${targetRect.width}px;
                    height: ${targetRect.height}px;
                    left: ${targetRect.left}px;
                    top: ${targetRect.top}px;
                    display: block;
                  `;
                  targetCell.style.background = 'rgba(59, 130, 246, 0.1)';
                  
                  // 清除其他单元格的高亮
                  cells.forEach(c => {
                    if (c !== targetCell && c !== cell) {
                      c.style.background = '';
                    }
                  });
                } else {
                  indicator.style.display = 'none';
                  // 清除所有高亮
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

                // 清理样式和元素
                cell.classList.remove('dragging-cell');
                cell.style.cursor = '';
                indicator.remove();
                preview.remove();

                // 清除所有高亮
                cells.forEach(c => {
                  c.style.background = '';
                });

                // 查找目标单元格并执行交换
                const targetCell = document.elementFromPoint(e.clientX, e.clientY)?.closest('td, th') as HTMLElement;

                if (targetCell && cells.includes(targetCell) && targetCell !== cell) {
                  // 执行内容交换
                  const sourcePos = view.posAtDOM(cell, 0);
                  const targetPos = view.posAtDOM(targetCell, 0);

                  if (sourcePos !== null && targetPos !== null) {
                    const tr = view.state.tr;
                    const sourceNode = view.state.doc.nodeAt(sourcePos);
                    const targetNode = view.state.doc.nodeAt(targetPos);

                    if (sourceNode && targetNode) {
                      try {
                        // 交换单元格内容
                        const sourceContent = sourceNode.content;
                        const targetContent = targetNode.content;

                        tr.replaceWith(sourcePos + 1, sourcePos + sourceNode.nodeSize - 1, targetContent);
                        tr.replaceWith(targetPos + 1, targetPos + targetNode.nodeSize - 1, sourceContent);

                        view.dispatch(tr);

                        // 显示成功提示
                        showSuccessToast();
                      } catch (error) {
                        console.error('交换失败:', error);
                      }
                    }
                  }
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

// 成功提示函数
function showSuccessToast() {
  const toast = document.createElement('div');
  toast.textContent = '✅ 单元格交换成功';
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
    animation: slideIn 0.3s ease-out;
  `;
  
  // 添加动画样式
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2000);
}

// 添加样式
const addTableDragStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'table-drag-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    .ProseMirror td.dragging-cell, .ProseMirror th.dragging-cell {
      opacity: 0.7;
      background-color: rgba(59, 130, 246, 0.1) !important;
      transform: scale(0.98);
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .ProseMirror td, .ProseMirror th {
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .ProseMirror td:hover, .ProseMirror th:hover {
      background-color: rgba(59, 130, 246, 0.05);
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
    }

    /* 在单元格边缘显示拖拽提示 */
    .ProseMirror td::after, .ProseMirror th::after {
      content: "⋮⋮";
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%) rotate(90deg);
      font-size: 12px;
      color: rgba(59, 130, 246, 0.6);
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      font-weight: bold;
      letter-spacing: -2px;
    }

    .ProseMirror td:hover::after, .ProseMirror th:hover::after {
      opacity: 1;
    }

    /* 添加拖拽提示文本 */
    .ProseMirror td:hover::before, .ProseMirror th:hover::before {
      content: "按住Shift+拖拽交换";
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
  addTableDragStyles();
}

export default TableDragExtension;
