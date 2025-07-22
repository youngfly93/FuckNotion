import { storageManager } from './storage-manager';
import { db } from './database';
import type { Page } from './database';
import type { JSONContent } from 'novel';

// 导出格式类型
export type ExportFormat = 'json' | 'markdown' | 'obsidian' | 'notion' | 'html';

// 导出结果
interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

export class ExportManager {
  // 将 TipTap JSON 转换为 Markdown
  private static tiptapToMarkdown(content: JSONContent): string {
    if (!content || !content.content) {
      return '';
    }

    let markdown = '';

    const processNode = (node: any): string => {
      if (node.type === 'text') {
        let text = node.text || '';
        
        // 应用格式化
        if (node.marks) {
          for (const mark of node.marks) {
            switch (mark.type) {
              case 'bold':
                text = `**${text}**`;
                break;
              case 'italic':
                text = `*${text}*`;
                break;
              case 'code':
                text = `\`${text}\``;
                break;
              case 'link':
                text = `[${text}](${mark.attrs?.href || ''})`;
                break;
            }
          }
        }
        
        return text;
      }

      if (node.content) {
        const content = node.content.map(processNode).join('');
        
        switch (node.type) {
          case 'paragraph':
            return content + '\n\n';
          case 'heading':
            const level = node.attrs?.level || 1;
            return '#'.repeat(level) + ' ' + content + '\n\n';
          case 'bulletList':
            return content;
          case 'orderedList':
            return content;
          case 'listItem':
            return '- ' + content.trim() + '\n';
          case 'codeBlock':
            const language = node.attrs?.language || '';
            return `\`\`\`${language}\n${content}\`\`\`\n\n`;
          case 'blockquote':
            return content.split('\n').map(line => line ? `> ${line}` : '>').join('\n') + '\n\n';
          case 'hardBreak':
            return '\n';
          default:
            return content;
        }
      }

      return '';
    };

    return content.content.map(processNode).join('').trim();
  }

  // 生成 Frontmatter
  private static generateFrontmatter(page: Page): string {
    const frontmatter = {
      title: page.title,
      slug: page.slug,
      created: page.createdAt.toISOString(),
      updated: page.updatedAt.toISOString(),
      ...(page.tags && page.tags.length > 0 && { tags: page.tags }),
      ...(page.parentSlug && { parent: page.parentSlug }),
      ...(page.isSubPage && { subpage: true })
    };

    const yaml = Object.entries(frontmatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`;
        }
        return `${key}: "${value}"`;
      })
      .join('\n');

    return `---\n${yaml}\n---\n\n`;
  }

  // 下载文件
  private static downloadFile(content: string, fileName: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  // 导出为 JSON 格式
  static async exportAsJSON(): Promise<ExportResult> {
    try {
      const pages = await db.pages.toArray();
      const settings = await db.settings.toArray();
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        pages: pages.map(page => ({
          ...page,
          id: undefined // 移除 ID
        })),
        settings: settings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>)
      };

      const fileName = `fucknotion-backup-${new Date().toISOString().split('T')[0]}.json`;
      this.downloadFile(
        JSON.stringify(exportData, null, 2),
        fileName,
        'application/json'
      );

      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting as JSON:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  // 导出为 Markdown 格式（ZIP 包）
  static async exportAsMarkdown(): Promise<ExportResult> {
    try {
      const pages = await db.pages.toArray();
      
      // 创建一个简单的打包函数（实际项目中可能需要使用 JSZip）
      const files: Record<string, string> = {};
      
      for (const page of pages) {
        const frontmatter = this.generateFrontmatter(page);
        const markdown = this.tiptapToMarkdown(page.content);
        const content = frontmatter + markdown;
        
        // 生成安全的文件名
        const safeTitle = page.title.replace(/[^a-zA-Z0-9\-_]/g, '-');
        const fileName = `${safeTitle}.md`;
        
        files[fileName] = content;
      }

      // 由于浏览器限制，我们将所有文件合并为一个文本文件
      let combinedContent = '# FuckNotion Export\n\n';
      combinedContent += `Exported on: ${new Date().toISOString()}\n`;
      combinedContent += `Total pages: ${pages.length}\n\n`;
      combinedContent += '---\n\n';

      Object.entries(files).forEach(([fileName, content]) => {
        combinedContent += `## File: ${fileName}\n\n`;
        combinedContent += content;
        combinedContent += '\n\n---\n\n';
      });

      const exportFileName = `fucknotion-markdown-export-${new Date().toISOString().split('T')[0]}.md`;
      this.downloadFile(combinedContent, exportFileName, 'text/markdown');

      return { success: true, fileName: exportFileName };
    } catch (error) {
      console.error('Error exporting as Markdown:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  // 导出为 Obsidian 格式
  static async exportAsObsidian(): Promise<ExportResult> {
    try {
      const pages = await db.pages.toArray();
      let vaultContent = '# Obsidian Vault Export\n\n';
      vaultContent += `Created from FuckNotion on ${new Date().toISOString()}\n\n`;
      vaultContent += '## Instructions\n\n';
      vaultContent += '1. Create a new folder for your Obsidian vault\n';
      vaultContent += '2. Copy each section below into separate `.md` files\n';
      vaultContent += '3. Use the suggested filenames\n\n';
      vaultContent += '---\n\n';

      for (const page of pages) {
        const markdown = this.tiptapToMarkdown(page.content);
        
        // Obsidian 特殊处理
        let obsidianMarkdown = markdown;
        
        // 转换页面链接为 Obsidian 格式 [[Page Name]]
        // 这里可以添加更多 Obsidian 特定的转换
        
        // 生成文件名建议
        const safeTitle = page.title.replace(/[^a-zA-Z0-9\s\-_]/g, '');
        const fileName = `${safeTitle}.md`;
        
        vaultContent += `## File: ${fileName}\n\n`;
        vaultContent += '```markdown\n';
        vaultContent += obsidianMarkdown;
        vaultContent += '\n```\n\n---\n\n';
      }

      const exportFileName = `fucknotion-obsidian-export-${new Date().toISOString().split('T')[0]}.txt`;
      this.downloadFile(vaultContent, exportFileName, 'text/plain');

      return { success: true, fileName: exportFileName };
    } catch (error) {
      console.error('Error exporting for Obsidian:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  // 导出为 HTML 格式
  static async exportAsHTML(): Promise<ExportResult> {
    try {
      const pages = await db.pages.toArray();
      
      let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FuckNotion Export</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px; 
            line-height: 1.6; 
            color: #333;
        }
        .page { 
            margin-bottom: 60px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 40px;
        }
        .page:last-child { 
            border-bottom: none; 
        }
        .page-title { 
            font-size: 2em; 
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .page-meta { 
            color: #666; 
            font-size: 0.9em; 
            margin-bottom: 20px;
        }
        .page-content {
            line-height: 1.8;
        }
        .page-content h1, .page-content h2, .page-content h3 {
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .page-content p {
            margin-bottom: 15px;
        }
        .page-content code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .page-content pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .toc {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 40px;
        }
        .toc h2 {
            margin-top: 0;
        }
        .toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        .toc li {
            margin-bottom: 5px;
        }
        .toc a {
            text-decoration: none;
            color: #3498db;
        }
        .toc a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>FuckNotion Export</h1>
    <p>Exported on ${new Date().toLocaleDateString()}</p>
    
    <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
            ${pages.map(page => 
              `<li><a href="#page-${page.slug}">${page.title}</a></li>`
            ).join('')}
        </ul>
    </div>
`;

      for (const page of pages) {
        const markdown = this.tiptapToMarkdown(page.content);
        // 简单的 Markdown 到 HTML 转换
        let htmlContent = markdown
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br>');

        htmlContent = '<p>' + htmlContent + '</p>';
        
        html += `
    <div class="page" id="page-${page.slug}">
        <h2 class="page-title">${page.title}</h2>
        <div class="page-meta">
            Created: ${page.createdAt.toLocaleDateString()} | 
            Updated: ${page.updatedAt.toLocaleDateString()}
        </div>
        <div class="page-content">
            ${htmlContent}
        </div>
    </div>
`;
      }

      html += `
</body>
</html>`;

      const fileName = `fucknotion-export-${new Date().toISOString().split('T')[0]}.html`;
      this.downloadFile(html, fileName, 'text/html');

      return { success: true, fileName };
    } catch (error) {
      console.error('Error exporting as HTML:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
    }
  }

  // 通用导出函数
  static async exportAs(format: ExportFormat): Promise<ExportResult> {
    switch (format) {
      case 'json':
        return this.exportAsJSON();
      case 'markdown':
        return this.exportAsMarkdown();
      case 'obsidian':
        return this.exportAsObsidian();
      case 'html':
        return this.exportAsHTML();
      default:
        return { success: false, error: `Unsupported export format: ${format}` };
    }
  }

  // 导入数据
  static async importFromJSON(file: File): Promise<{
    success: boolean;
    importedPages: number;
    errors: string[];
  }> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      return await import('./migration').then(module => 
        module.DataMigration.importData(data)
      );
    } catch (error) {
      console.error('Error importing JSON:', error);
      return {
        success: false,
        importedPages: 0,
        errors: [error instanceof Error ? error.message : 'Import failed']
      };
    }
  }

  // 获取存储统计信息
  static async getStorageStats(): Promise<{
    pageCount: number;
    totalSize?: number;
    quota?: number;
    usage?: number;
    percentUsed?: number;
  }> {
    return await storageManager.getStorageInfo();
  }
}