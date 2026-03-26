import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function invocation(overrides: Partial<ToolInvocation> & { args?: Record<string, unknown> }): ToolInvocation {
  return {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    state: "call",
    args: {},
    ...overrides,
  } as ToolInvocation;
}

// str_replace_editor — create
test("shows 'Creating' when creating a file", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "create", path: "/App.jsx" }, state: "call" })} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("shows 'Created' when file creation is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "create", path: "/App.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Created App.jsx")).toBeDefined();
});

// str_replace_editor — str_replace
test("shows 'Editing' for str_replace in progress", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "str_replace", path: "/Card.jsx" }, state: "call" })} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("shows 'Edited' when str_replace is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "str_replace", path: "/Card.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Edited Card.jsx")).toBeDefined();
});

// str_replace_editor — insert
test("shows 'Editing' for insert in progress", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "insert", path: "/Button.jsx" }, state: "call" })} />);
  expect(screen.getByText("Editing Button.jsx")).toBeDefined();
});

test("shows 'Edited' when insert is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "insert", path: "/Button.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Edited Button.jsx")).toBeDefined();
});

// str_replace_editor — view
test("shows 'Reading' when viewing a file", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "view", path: "/index.jsx" }, state: "call" })} />);
  expect(screen.getByText("Reading index.jsx")).toBeDefined();
});

test("shows 'Read' when view is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "view", path: "/index.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Read index.jsx")).toBeDefined();
});

// str_replace_editor — undo_edit
test("shows 'Undoing edit to' when undo is in progress", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "undo_edit", path: "/App.jsx" }, state: "call" })} />);
  expect(screen.getByText("Undoing edit to App.jsx")).toBeDefined();
});

test("shows 'Undid edit to' when undo is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "undo_edit", path: "/App.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Undid edit to App.jsx")).toBeDefined();
});

// file_manager — rename
test("shows 'Renaming' when rename is in progress", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ toolName: "file_manager", args: { command: "rename", path: "/OldName.jsx" }, state: "call" })} />);
  expect(screen.getByText("Renaming OldName.jsx")).toBeDefined();
});

test("shows 'Renamed' when rename is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ toolName: "file_manager", args: { command: "rename", path: "/OldName.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Renamed OldName.jsx")).toBeDefined();
});

// file_manager — delete
test("shows 'Deleting' when delete is in progress", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ toolName: "file_manager", args: { command: "delete", path: "/Unused.jsx" }, state: "call" })} />);
  expect(screen.getByText("Deleting Unused.jsx")).toBeDefined();
});

test("shows 'Deleted' when delete is complete", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ toolName: "file_manager", args: { command: "delete", path: "/Unused.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Deleted Unused.jsx")).toBeDefined();
});

// Fallback
test("falls back to 'Running toolName' for unknown tools", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ toolName: "unknownTool", state: "call" })} />);
  expect(screen.getByText("Running unknownTool")).toBeDefined();
});

test("falls back to 'Ran toolName' for completed unknown tools", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ toolName: "unknownTool", state: "result", result: "ok" } as ToolInvocation)} />);
  expect(screen.getByText("Ran unknownTool")).toBeDefined();
});

// Path trimming
test("shows only the filename, not the full path", () => {
  render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "create", path: "/src/components/Button.jsx" }, state: "call" })} />);
  expect(screen.getByText("Creating Button.jsx")).toBeDefined();
});

// Spinner vs green dot
test("shows spinner when in progress", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "create", path: "/App.jsx" }, state: "call" })} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when complete", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation({ args: { command: "create", path: "/App.jsx" }, state: "result", result: "ok" } as ToolInvocation)} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});
