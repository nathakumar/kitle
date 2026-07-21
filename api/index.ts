import type { VercelRequest, VercelResponse } from "@vercel/node";

// Import the prebuilt server SSR app
let app: any;

async function loadApp() {
  if (!app) {
    try {
      // Dynamically load the built server module
      const module = await import("../dist/server/server.js");
      app = module.default || module;
    } catch (error) {
      console.error("Failed to load server app:", error);
      throw error;
    }
  }
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    const serverApp = await loadApp();
    
    // Call the app directly if it's a handler function
    if (typeof serverApp === "function") {
      await serverApp(req, res);
    } else if (serverApp && typeof serverApp.listen === "function") {
      // If it's an Express-like app, attach to our response
      return new Promise((resolve) => {
        serverApp(req, res);
        res.once("finish", resolve);
        res.once("close", resolve);
      });
    } else {
      res.status(500).json({ error: "Invalid server configuration" });
    }
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
