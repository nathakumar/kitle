import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import listModesTool from "./tools/list-modes";
import listProvidersTool from "./tools/list-providers";

export default defineMcp({
  name: "nuvic-app-mcp",
  title: "Nuvic App MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Nuvic AI app builder. Use `list_modes` to discover the assistant modes (website, data, learn, chat, write), `list_providers` to see BYOK chat providers, and `echo` to verify connectivity.",
  tools: [echoTool, listModesTool, listProvidersTool],
});
