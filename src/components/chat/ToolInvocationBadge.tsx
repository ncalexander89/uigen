"use client";

import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args, state } = toolInvocation;
  const done = state === "result";
  const file = args?.path ? args.path.split("/").filter(Boolean).pop() : null;

  if (toolName === "str_replace_editor") {
    switch (args?.command) {
      case "create":
        return done ? `Created ${file}` : `Creating ${file}`;
      case "str_replace":
      case "insert":
        return done ? `Edited ${file}` : `Editing ${file}`;
      case "view":
        return done ? `Read ${file}` : `Reading ${file}`;
      case "undo_edit":
        return done ? `Undid edit to ${file}` : `Undoing edit to ${file}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args?.command) {
      case "rename":
        return done ? `Renamed ${file}` : `Renaming ${file}`;
      case "delete":
        return done ? `Deleted ${file}` : `Deleting ${file}`;
    }
  }

  return done ? `Ran ${toolName}` : `Running ${toolName}`;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const done = toolInvocation.state === "result";
  const label = getLabel(toolInvocation);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 flex-shrink-0" />
      )}
      <span>{label}</span>
    </div>
  );
}
