"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getLabel(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":     return `Creating ${args.path}`;
      case "str_replace":
      case "insert":     return `Editing ${args.path}`;
      case "view":       return `Viewing ${args.path}`;
      case "undo_edit":  return `Undoing edit on ${args.path}`;
    }
  }
  if (toolName === "file_manager") {
    switch (args.command) {
      case "delete": return `Deleting ${args.path}`;
      case "rename": return `Renaming ${args.path} → ${args.new_path}`;
    }
  }
  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const isDone = toolInvocation.state === "result" && toolInvocation.result != null;
  const label = getLabel(toolInvocation.toolName, toolInvocation.args as Record<string, unknown>);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
