import { createServerFn } from "@tanstack/react-start";

type ChatMsg = { role: "user" | "assistant"; content: string };
type FileMap = Record<string, string>;

export type GenerateInput = {
  messages: ChatMsg[];
  currentFiles: FileMap;
};

export type GenerateResult = {
  files: FileMap;
  summary: string;
};

const SYSTEM_PROMPT = `You are an expert front-end engineer. You generate small, self-contained React + TypeScript + Vite projects that run inside a Sandpack "react-ts" sandbox.

STRICT RULES:
- Always return a COMPLETE working project via the emit_project tool. Never reply in prose.
- Required files for every project: "/index.html", "/index.tsx" (entry), "/App.tsx", "/styles.css".
- Use plain CSS in /styles.css. Do NOT use Tailwind, shadcn, or any external UI library.
- Only standard dependencies: react, react-dom. Do NOT import other npm packages.
- /index.tsx must mount <App /> into #root using react-dom/client createRoot.
- /index.html must contain <div id="root"></div> and <script type="module" src="/index.tsx"></script>.
- Code must be production-quality, typed, and runnable with NO additional setup.

PROJECT STRUCTURE — split code across MULTIPLE files, never cram everything into App.tsx:
- Put each reusable UI component in its own file under "/components/ComponentName.tsx".
- Put each page/screen/view in its own file under "/pages/PageName.tsx".
- Put each custom hook in its own file under "/hooks/useThing.ts".
- Put types in "/types.ts" and small utilities in "/lib/<name>.ts" when useful.
- App.tsx should be a thin composition root that imports from the folders above.
- Aim for at least 6–10 files for any non-trivial app, each focused and small.
- Use relative imports like "./components/Header" — never "@/..." aliases.

INCREMENTAL EDITS:
- When the user asks for changes, MODIFY the existing files (provided as currentFiles) — keep the same file paths unless a new file is genuinely needed.
- Always return the FULL set of files (every file the project needs to run), not just the changed ones.

The "summary" field is a short (max 2 sentences) human-readable description of what changed or was built.`;

export const generateProject = createServerFn({ method: "POST" })
  .inputValidator((input: GenerateInput) => {
    if (!input || !Array.isArray(input.messages)) {
      throw new Error("Invalid input: messages required");
    }
    return input;
  })
  .handler(async ({ data }): Promise<GenerateResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const hasCurrent = Object.keys(data.currentFiles).length > 0;
    const contextMsg: ChatMsg | null = hasCurrent
      ? {
          role: "user",
          content:
            "CURRENT PROJECT FILES (modify these — do not start over):\n\n" +
            Object.entries(data.currentFiles)
              .map(([p, c]) => `=== ${p} ===\n${c}`)
              .join("\n\n"),
        }
      : null;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(contextMsg ? [contextMsg] : []),
      ...data.messages,
    ];

    const body = {
      model: "google/gemini-3-flash-preview",
      messages,
      tools: [
        {
          type: "function",
          function: {
            name: "emit_project",
            description: "Emit the complete set of project files plus a short summary.",
            parameters: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Short 1-2 sentence summary of what was built or changed." },
                files: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: { type: "string", description: "Absolute path starting with /, e.g. /App.tsx" },
                      content: { type: "string", description: "Full file contents." },
                    },
                    required: ["path", "content"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["summary", "files"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "emit_project" } },
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        throw new Error("Rate limited. Please wait a moment and try again.");
      }
      if (resp.status === 402) {
        throw new Error("AI credits exhausted. Add credits in Workspace Settings → Usage.");
      }
      const t = await resp.text().catch(() => "");
      console.error("AI gateway error", resp.status, t);
      throw new Error(`AI gateway error (${resp.status})`);
    }

    const json = await resp.json();
    const toolCall = json?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("Model did not return a project. Try again.");
    }

    let args: { summary: string; files: { path: string; content: string }[] };
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch {
      throw new Error("Failed to parse model output.");
    }

    const fileMap: FileMap = {};
    for (const f of args.files) {
      const path = f.path.startsWith("/") ? f.path : `/${f.path}`;
      fileMap[path] = f.content;
    }

    return { files: fileMap, summary: args.summary || "Project updated." };
  });
