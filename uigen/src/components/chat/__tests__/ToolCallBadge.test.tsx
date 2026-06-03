import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "partial-call" | "result" = "result",
  result: unknown = "ok"
): ToolInvocation {
  if (state === "result") {
    return { toolCallId: "id", toolName, args, state, result } as ToolInvocation;
  }
  return { toolCallId: "id", toolName, args, state } as ToolInvocation;
}

// --- Label rendering ---

test("str_replace_editor create", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "src/App.tsx" })} />);
  expect(screen.getByText("Creating src/App.tsx")).toBeDefined();
});

test("str_replace_editor str_replace", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "str_replace", path: "src/index.ts" })} />);
  expect(screen.getByText("Editing src/index.ts")).toBeDefined();
});

test("str_replace_editor insert", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "insert", path: "src/utils.ts" })} />);
  expect(screen.getByText("Editing src/utils.ts")).toBeDefined();
});

test("str_replace_editor view", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "README.md" })} />);
  expect(screen.getByText("Viewing README.md")).toBeDefined();
});

test("str_replace_editor undo_edit", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "undo_edit", path: "src/App.tsx" })} />);
  expect(screen.getByText("Undoing edit on src/App.tsx")).toBeDefined();
});

test("file_manager delete", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("file_manager", { command: "delete", path: "old/file.ts" })} />);
  expect(screen.getByText("Deleting old/file.ts")).toBeDefined();
});

test("file_manager rename", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("file_manager", { command: "rename", path: "a.ts", new_path: "b.ts" })} />);
  expect(screen.getByText("Renaming a.ts → b.ts")).toBeDefined();
});

test("unknown tool falls back to toolName", () => {
  render(<ToolCallBadge toolInvocation={makeInvocation("my_custom_tool", {})} />);
  expect(screen.getByText("my_custom_tool")).toBeDefined();
});

// --- Visual state ---

test("state=call shows spinner, no green dot", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "f" }, "call")} />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("state=partial-call shows spinner", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "f" }, "partial-call")} />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("state=result with null result shows spinner", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "f" }, "result", null)} />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("state=result with string result shows green dot", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "f" }, "result", "ok")} />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("state=result with object result shows green dot", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "create", path: "f" }, "result", { success: true })} />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
});

// --- Structure ---

test("wrapper has correct static classes", () => {
  const { container } = render(
    <ToolCallBadge toolInvocation={makeInvocation("str_replace_editor", { command: "view", path: "f" })} />
  );
  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("inline-flex");
  expect(wrapper.className).toContain("items-center");
  expect(wrapper.className).toContain("font-mono");
  expect(wrapper.className).toContain("border-neutral-200");
});
