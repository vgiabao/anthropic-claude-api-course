import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

// --- mocks ---

vi.mock("@/lib/file-system", () => {
  const VirtualFileSystem = vi.fn(() => ({
    deserializeFromNodes: vi.fn(),
    serialize: vi.fn(() => ({ files: {} })),
  }));
  return { VirtualFileSystem };
});

vi.mock("@/lib/tools/str-replace", () => ({
  buildStrReplaceTool: vi.fn(() => ({ strReplaceTool: true })),
}));

vi.mock("@/lib/tools/file-manager", () => ({
  buildFileManagerTool: vi.fn(() => ({ fileManagerTool: true })),
}));

vi.mock("@/lib/prompts/generation", () => ({
  generationPrompt: "You are a helpful assistant.",
}));

vi.mock("@/lib/provider", () => ({
  getLanguageModel: vi.fn(() => "mock-model"),
}));

vi.mock("@/lib/auth", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      update: vi.fn(),
    },
  },
}));

const mockDataStreamResponse = { body: "stream" };
const mockStreamText = vi.fn(() => ({
  toDataStreamResponse: () => mockDataStreamResponse,
}));

vi.mock("ai", () => ({
  streamText: (...args: any[]) => mockStreamText(...args),
  appendResponseMessages: vi.fn((opts) => opts.messages),
}));

// --- helpers ---

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendResponseMessages } from "ai";

const mockGetSession = vi.mocked(getSession);
const mockPrismaUpdate = vi.mocked(prisma.project.update);
const mockAppendResponseMessages = vi.mocked(appendResponseMessages);

function makeRequest(body: object) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const baseMessages = [{ role: "user", content: "Build a button" }];
const baseFiles = {};

// --- tests ---

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a data stream response", async () => {
    const res = await POST(makeRequest({ messages: baseMessages, files: baseFiles }));
    expect(res).toBe(mockDataStreamResponse);
  });

  it("prepends the system prompt as the first message", async () => {
    await POST(makeRequest({ messages: baseMessages, files: baseFiles }));

    const [call] = mockStreamText.mock.calls;
    const [opts] = call;
    expect(opts.messages[0].role).toBe("system");
    expect(opts.messages[0].content).toBe("You are a helpful assistant.");
  });

  it("passes anthropic ephemeral cache control on the system message", async () => {
    await POST(makeRequest({ messages: baseMessages, files: baseFiles }));

    const systemMsg = mockStreamText.mock.calls[0][0].messages[0];
    expect(systemMsg.providerOptions?.anthropic?.cacheControl?.type).toBe("ephemeral");
  });

  it("passes both tools to streamText", async () => {
    await POST(makeRequest({ messages: baseMessages, files: baseFiles }));

    const { tools } = mockStreamText.mock.calls[0][0];
    expect(tools).toHaveProperty("str_replace_editor");
    expect(tools).toHaveProperty("file_manager");
  });

  it("includes original user messages after the system message", async () => {
    await POST(makeRequest({ messages: baseMessages, files: baseFiles }));

    const msgs = mockStreamText.mock.calls[0][0].messages;
    // index 0 = system, index 1 = user message
    expect(msgs[1]).toEqual({ role: "user", content: "Build a button" });
  });

  describe("project persistence via onFinish", () => {
    async function triggerOnFinish(
      projectId?: string,
      session?: object | null,
      responseMessages = []
    ) {
      await POST(makeRequest({ messages: baseMessages, files: baseFiles, projectId }));
      mockGetSession.mockResolvedValue(session as any);
      const { onFinish } = mockStreamText.mock.calls[0][0];
      await onFinish({ response: { messages: responseMessages } });
    }

    it("does not call prisma when projectId is absent", async () => {
      await triggerOnFinish(undefined, { userId: "u1" });
      expect(mockPrismaUpdate).not.toHaveBeenCalled();
    });

    it("does not call prisma when user is not authenticated", async () => {
      await triggerOnFinish("proj-1", null);
      expect(mockPrismaUpdate).not.toHaveBeenCalled();
    });

    it("saves messages and file system data when authenticated with projectId", async () => {
      const session = { userId: "u1", email: "a@b.com" };
      await triggerOnFinish("proj-1", session);

      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "proj-1", userId: "u1" },
          data: expect.objectContaining({
            messages: expect.any(String),
            data: expect.any(String),
          }),
        })
      );
    });

    it("excludes the injected system message from persisted messages", async () => {
      const session = { userId: "u1", email: "a@b.com" };
      await triggerOnFinish("proj-1", session);

      const allMsgsSent = mockAppendResponseMessages.mock.calls[0][0].messages;
      expect(allMsgsSent.every((m: any) => m.role !== "system")).toBe(true);
    });

    it("does not throw when prisma.update rejects", async () => {
      mockPrismaUpdate.mockRejectedValueOnce(new Error("DB error"));
      const session = { userId: "u1", email: "a@b.com" };
      // Should resolve without throwing
      await expect(triggerOnFinish("proj-1", session)).resolves.not.toThrow();
    });
  });

  describe("maxSteps selection", () => {
    const cases = [
      { apiKey: undefined, label: "no API key (mock provider)", expected: 4 },
      { apiKey: "sk-real-key", label: "real API key", expected: 40 },
    ];

    for (const { apiKey, label, expected } of cases) {
      it(`uses maxSteps=${expected} with ${label}`, async () => {
        const original = process.env.ANTHROPIC_API_KEY;
        if (apiKey) {
          process.env.ANTHROPIC_API_KEY = apiKey;
        } else {
          delete process.env.ANTHROPIC_API_KEY;
        }

        await POST(makeRequest({ messages: baseMessages, files: baseFiles }));
        expect(mockStreamText.mock.calls[0][0].maxSteps).toBe(expected);

        process.env.ANTHROPIC_API_KEY = original;
      });
    }
  });

  it("exports maxDuration of 120", async () => {
    const mod = await import("../route");
    expect((mod as any).maxDuration).toBe(120);
  });
});
