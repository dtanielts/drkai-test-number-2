import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

console.log("--- server.ts loading ---");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
let db: any;
const dbPath = path.join(__dirname, "signups.db");
console.log(`Database path: ${dbPath}`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log("--- Server Starting ---");
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

  // Initialize Database inside startServer to catch errors during startup
  try {
    console.log(`Initializing database at: ${dbPath}`);
    const { default: Database } = await import("better-sqlite3");
    db = new Database(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized successfully");
  } catch (err: any) {
    console.error("Failed to initialize database:", err);
    console.log("Falling back to in-memory database");
    try {
      const { default: Database } = await import("better-sqlite3");
      db = new Database(":memory:");
      db.exec(`
        CREATE TABLE IF NOT EXISTS signups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          role TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (innerErr: any) {
      console.error("Critical: Failed to load better-sqlite3 even for in-memory:", innerErr);
      // Last resort: mock DB object to prevent crashes
      db = {
        prepare: () => ({
          run: () => ({ lastInsertRowid: Date.now() }),
          get: () => null,
          all: () => []
        }),
        exec: () => {}
      };
    }
  }
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Root debug route
  app.get("/api/debug-server", (req, res) => {
    res.json({
      message: "Server is alive",
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      cwd: process.cwd(),
      db: db ? "initialized" : "null"
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    console.log("Health check requested");
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV,
      db: db ? "connected" : "missing"
    });
  });

  // Test endpoint
  app.get("/api/test", (req, res) => {
    try {
      const test = db.prepare("SELECT 1 as result").get();
      res.json({ message: "API is working", timestamp: Date.now(), db: test });
    } catch (err: any) {
      res.status(500).json({ error: "Database test failed", details: err.message });
    }
  });

  // API Routes
  app.post("/api/signup", async (req, res) => {
    console.log("Signup POST received:", req.body);
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Save to local SQLite database
      const stmt = db.prepare("INSERT INTO signups (name, email, role) VALUES (?, ?, ?)");
      const result = stmt.run(name, email, role);
      console.log("Saved to SQLite, ID:", result.lastInsertRowid);

      // 2. (Optional) Forward to Google Form if configured
      let googleFormUrl = process.env.GOOGLE_FORM_URL;
      const nameEntryId = process.env.GOOGLE_FORM_NAME_ENTRY_ID;
      const emailEntryId = process.env.GOOGLE_FORM_EMAIL_ENTRY_ID;
      const roleEntryId = process.env.GOOGLE_FORM_ROLE_ENTRY_ID;

      if (googleFormUrl) {
        // Clean up URL: convert /edit or /viewform to /formResponse
        googleFormUrl = googleFormUrl.replace(/\/(edit|viewform|viewanalytics)$|$/, "/formResponse");
        
        try {
          const params = new URLSearchParams();
          if (nameEntryId) params.append(`entry.${nameEntryId}`, name);
          if (emailEntryId) params.append(`entry.${emailEntryId}`, email);
          if (roleEntryId) params.append(`entry.${roleEntryId}`, role);

          if (params.toString()) {
            const finalUrl = `${googleFormUrl}?${params.toString()}`;
            console.log("Forwarding to Google Form:", finalUrl);
            
            // Submit to Google Form
            fetch(finalUrl, { method: 'POST' })
              .then(() => console.log("Google Form submission sent"))
              .catch(err => console.error("Google Form submission failed:", err));
          }
        } catch (gfError) {
          console.error("Error preparing Google Form submission:", gfError);
        }
      }

      res.status(201).json({ id: result.lastInsertRowid, message: "Signup successful" });
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(409).json({ error: "Email already registered" });
      }
      console.error("Database error:", error);
      res.status(500).json({ error: "Failed to store signup" });
    }
  });

  // Admin Route to retrieve data
  app.get("/api/admin/signups", (req, res) => {
    try {
      const signups = db.prepare("SELECT * FROM signups ORDER BY created_at DESC").all();
      res.json(signups);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve signups" });
    }
  });

  // Lookup route to retrieve specific user data by email
  app.get("/api/lookup/:email", (req, res) => {
    const { email } = req.params;
    try {
      const signup = db.prepare("SELECT * FROM signups WHERE email = ?").get(email);
      if (signup) {
        res.json(signup);
      } else {
        res.status(404).json({ error: "No signup found for this email" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to lookup signup" });
    }
  });

  // Catch-all for unhandled API routes
  app.all("/api/*", (req, res) => {
    console.log(`Unhandled API request: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, "dist");
    console.log(`Serving static files from: ${distPath}`);
    
    if (dbPath.includes('home')) {
       // We are likely in the container environment
       console.log("Detected container environment");
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      console.log(`Fallback route hit for: ${req.url}`);
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
