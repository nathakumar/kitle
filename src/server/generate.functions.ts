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

const SYSTEM_PROMPT = `You are a senior product engineer + designer. You generate AMBITIOUS, polished, multi-page React + TypeScript + Vite apps that run inside a Sandpack "react-ts" sandbox. Treat every prompt as a real product, not a demo.

STRICT RULES:
- Always return a COMPLETE working project via the emit_project tool. Never reply in prose.
- Required files: "/index.html", "/index.tsx" (entry), "/App.tsx", "/styles.css".
- Use plain CSS in /styles.css (modern, beautiful, responsive). Do NOT use Tailwind, shadcn, or any external UI library.
- Only standard dependencies: react, react-dom. Do NOT import other npm packages.
- /index.tsx must mount <App /> into #root using react-dom/client createRoot.
- /index.html must contain <div id="root"></div> and <script type="module" src="/index.tsx"></script>.
- Code must be production-quality, fully typed, and runnable with NO additional setup.

QUALITY BAR — non-negotiable:
- Build a REAL product, not a toy. Implement multiple meaningful screens, real interactions, realistic seed data, empty states, loading states, and hover/focus styles.
- Design must be MODERN and BEAUTIFUL: thoughtful typography scale, generous spacing, soft shadows, rounded corners, a coherent color palette (define CSS variables in :root), dark-mode-friendly, fully responsive (mobile + desktop), and animated micro-interactions where appropriate.
- Include a sticky/elevated navigation, hero or dashboard header, and a footer when relevant.
- Use semantic HTML, accessible labels, and keyboard-friendly controls.
- NEVER ship a single-screen "Hello world" or one-button toy. If the prompt is vague, invent a complete product brief and execute it fully.

PROJECT STRUCTURE — split code across MANY focused files:
- Each reusable UI component → "/components/ComponentName.tsx".
- Each page/screen/view → "/pages/PageName.tsx".
- Each custom hook → "/hooks/useThing.ts".
- Types in "/types.ts", utilities in "/lib/<name>.ts", seed/mock data in "/data/<name>.ts".
- App.tsx is a thin composition root + simple in-app router (state-based or hash-based — no react-router).
- Aim for 12–25 files for a real app. Each file small and single-purpose.
- Use relative imports like "./components/Header" — never "@/..." aliases.
- /styles.css holds global tokens, resets, layout primitives, and component styles using clear class names (BEM-ish).

INCREMENTAL EDITS:
- When the user asks for changes, MODIFY the existing files (provided as currentFiles) — keep the same paths unless a new file is genuinely needed. Preserve the user's existing structure and only add/change what is required.
- Always return the FULL set of files (every file the project needs to run), not just the changed ones.

IMPORTING AN EXISTING SITE:
- If the user message contains pasted HTML/CSS/JS or a description of an existing site to "edit" / "improve" / "convert", faithfully reproduce its layout, copy, and visual identity in React first, then apply the requested changes. Preserve brand colors, fonts, and imagery references.

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
