"use client";

import { useState } from "react";
import { Button } from "@/components/tailwind/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tailwind/ui/dropdown-menu";
import { Download, FileText, File } from "lucide-react";
import { exportToMarkdown, exportToPDF } from "@/lib/export-utils";

interface ExportMenuProps {
  title: string;
  content: any;
  pageSlug: string;
}

export default function ExportMenu({ title, content, pageSlug }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportMarkdown = async () => {
    try {
      setIsExporting(true);
      await exportToMarkdown(title, content, pageSlug);
    } catch (error) {
      console.error("导出Markdown失败:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportToPDF(title, content, pageSlug);
    } catch (error) {
      console.error("导出PDF失败:", error);
      alert("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="neo-button gap-2 text-white border-white hover:bg-white hover:text-black" disabled={isExporting}>
          <Download className="h-4 w-4" />
          <span className="neo-text">{isExporting ? "导出中..." : "导出"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="neo-card p-2">
        <DropdownMenuItem onClick={handleExportMarkdown} disabled={isExporting} className="neo-button mb-1 last:mb-0">
          <FileText className="h-4 w-4 mr-2" />
          <span className="neo-text">导出为 MARKDOWN</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting} className="neo-button mb-1 last:mb-0">
          <File className="h-4 w-4 mr-2" />
          <span className="neo-text">导出为 PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
