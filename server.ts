import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

console.log("--- server.ts loading ---");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

async function startServer() {
  const PORT = 3000;

  console.log("--- Server Starting ---");
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV
    });
  });

  // API Routes
  app.post("/api/signup", async (req, res) => {
    console.log("Signup POST received:", req.body);
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Forward to Google Form if configured
    let googleFormUrl = process.env.GOOGLE_FORM_URL;
    const nameEntryId = process.env.GOOGLE_FORM_NAME_ENTRY_ID;
    const emailEntryId = process.env.GOOGLE_FORM_EMAIL_ENTRY_ID;
    const roleEntryId = process.env.GOOGLE_FORM_ROLE_ENTRY_ID;

    if (!googleFormUrl) {
      console.log("Warning: GOOGLE_FORM_URL not configured. Signup received but not forwarded.");
      return res.status(201).json({ message: "Signup received (not forwarded to Google Forms)" });
    }

    try {
      // Clean up URL: convert /edit or /viewform to /formResponse
      googleFormUrl = googleFormUrl.replace(/\/(edit|viewform|viewanalytics)$|$/, "/formResponse");
      
      const params = new URLSearchParams();
      if (nameEntryId) params.append(`entry.${nameEntryId}`, name);
      if (emailEntryId) params.append(`entry.${emailEntryId}`, email);
      if (roleEntryId) params.append(`entry.${roleEntryId}`, role);

      const finalUrl = `${googleFormUrl}?${params.toString()}`;
      console.log("Forwarding to Google Form:", finalUrl);
      
      // Submit to Google Form using fetch
      const gfResponse = await fetch(finalUrl, { method: 'POST' });
      
      // Google Forms usually returns 200 even if it's a redirect to a success page
      console.log("Google Form submission status:", gfResponse.status);

      res.status(201).json({ message: "Signup successful" });
    } catch (error: any) {
      console.error("Error forwarding to Google Form:", error);
      res.status(500).json({ error: "Failed to forward signup to Google Forms" });
    }
  });

  // Catch-all for unhandled API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not on Vercel
  if (!process.env.VERCEL && !process.env.NOW_REGION) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
