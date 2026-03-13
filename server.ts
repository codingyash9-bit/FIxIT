import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Simulated System State ---
  let systemState = {
    services: [
      { id: "api-gateway", name: "API Gateway", status: "healthy", cpu: 12, memory: 150, uptime: "14d 2h" },
      { id: "auth-service", name: "Auth Service", status: "healthy", cpu: 5, memory: 80, uptime: "14d 2h" },
      { id: "payment-service", name: "Payment Service", status: "healthy", cpu: 8, memory: 120, uptime: "14d 2h" },
      { id: "db-cluster", name: "Database Cluster", status: "healthy", cpu: 20, memory: 450, uptime: "45d 12h" },
    ],
    logs: [
      { timestamp: new Date().toISOString(), level: "INFO", service: "system", message: "System initialized. All services healthy." }
    ],
    incidents: [] as any[],
    isIncidentActive: false,
    lastIncidentType: null as string | null,
  };

  // Helper to add logs
  const addLog = (level: string, service: string, message: string) => {
    const log = { timestamp: new Date().toISOString(), level, service, message };
    systemState.logs.push(log);
    if (systemState.logs.length > 100) systemState.logs.shift();
    return log;
  };

  // --- API Routes ---

  app.get("/api/system/status", (req, res) => {
    res.json(systemState);
  });

  // CLI Landing Page
  app.get("/cli", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "cli-landing.html"));
  });

  app.post("/api/fix", async (req, res) => {
    const { code, error } = req.body;
    addLog("INFO", "cli-agent", ">> ACTION_INITIATED: Remote CLI Fix Request");
    
    // Use existing fix logic
    const lines = code.split('\n');
    const fixedCode = code.replace(/var/g, 'const').replace(/==/g, '===');
    
    res.json({ fixedCode });
  });

  app.post("/api/system/trigger-incident", (req, res) => {
    const { type } = req.body;
    if (systemState.isIncidentActive) return res.status(400).json({ error: "Incident already active" });

    systemState.isIncidentActive = true;
    systemState.lastIncidentType = type;

    if (type === "service_crash") {
      const service = systemState.services.find(s => s.id === "payment-service");
      if (service) {
        service.status = "crashed";
        service.cpu = 0;
        addLog("ERROR", "payment-service", "Fatal error: Uncaught exception in request handler. Service exited with code 1.");
        addLog("ERROR", "api-gateway", "Upstream payment-service returned 502 Bad Gateway.");
      }
    } else if (type === "db_connection_error") {
      const db = systemState.services.find(s => s.id === "db-cluster");
      if (db) {
        db.status = "degraded";
        addLog("ERROR", "db-cluster", "Connection pool exhausted. Max connections (100) reached.");
        addLog("ERROR", "auth-service", "Failed to acquire database connection. Timeout after 5000ms.");
      }
    } else if (type === "memory_leak") {
      const service = systemState.services.find(s => s.id === "auth-service");
      if (service) {
        service.status = "warning";
        service.memory = 850; // High memory
        addLog("WARN", "auth-service", "Memory usage critical: 850MB / 1024MB. GC overhead limit exceeded.");
      }
    }

    res.json({ message: "Incident triggered", type });
  });

  // --- Agent Tools (Simulated) ---

  app.post("/api/tools/restart-service", (req, res) => {
    const { serviceId } = req.body;
    const service = systemState.services.find(s => s.id === serviceId);
    if (service) {
      service.status = "healthy";
      service.cpu = 5;
      service.memory = 100;
      service.uptime = "0s";
      addLog("INFO", "system", `>> ACTION_INITIATED: Restarting service ${serviceId}`);
      addLog("INFO", serviceId, "Service restarted successfully.");
      systemState.isIncidentActive = false;
      res.json({ status: "success", message: `Service ${serviceId} restarted.` });
    } else {
      res.status(404).json({ error: "Service not found" });
    }
  });

  app.post("/api/tools/reset-db-connections", (req, res) => {
    const db = systemState.services.find(s => s.id === "db-cluster");
    if (db) {
      db.status = "healthy";
      addLog("INFO", "system", ">> ACTION_INITIATED: Resetting database connection pool");
      addLog("INFO", "db-cluster", "Connection pool cleared. Active connections: 0.");
      systemState.isIncidentActive = false;
      res.json({ status: "success", message: "Database connections reset." });
    } else {
      res.status(404).json({ error: "DB cluster not found" });
    }
  });

  app.post("/api/tools/apply-code-patch", (req, res) => {
    addLog("INFO", "system", ">> ACTION_INITIATED: Applying code patch to repository");
    addLog("INFO", "system", "Patch applied: fixed memory leak in session handler.");
    const service = systemState.services.find(s => s.id === "auth-service");
    if (service) {
        service.status = "healthy";
        service.memory = 80;
    }
    systemState.isIncidentActive = false;
    res.json({ status: "success", message: "Code patch applied." });
  });

  app.get("/api/system/health-check", (req, res) => {
    const allHealthy = systemState.services.every(s => s.status === "healthy");
    res.json({ status: allHealthy ? "healthy" : "unhealthy", details: systemState.services });
  });

  app.post("/api/agent/fix-code", async (req, res) => {
    const { code, description } = req.body;
    
    // In a real app, we'd call Gemini here. For now, we simulate a sophisticated response.
    // We'll use a simple logic to "fix" common patterns or just return a structured mock fix.
    
    addLog("INFO", "agent", ">> ACTION_INITIATED: Deep Code Analysis");
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // We try to find a "buggy" line to highlight. 
    // For the demo, we'll just pick a random line or look for common patterns.
    const lines = code.split('\n');
    let bugLineIndex = lines.findIndex(l => l.includes('var') || l.includes('==') || l.includes('console.log'));
    if (bugLineIndex === -1) bugLineIndex = Math.floor(Math.random() * lines.length);

    const result = {
      originalCode: code,
      fixedCode: code.replace(/var/g, 'const').replace(/==/g, '==='), 
      bugLine: bugLineIndex + 1,
      errorLocation: `Line ${bugLineIndex + 1}: Potential structural vulnerability detected.`,
      changes: [
        "Converted legacy 'var' declarations to 'const' for block scoping.",
        "Replaced loose equality '==' with strict equality '==='.",
        "Optimized execution path to reduce heap allocation."
      ],
      explanation: "The provided source code contained several architectural anti-patterns. Specifically, the use of non-block-scoped variables and loose equality checks can lead to unpredictable runtime behavior and memory leaks in high-concurrency environments."
    };

    addLog("INFO", "agent", "[RESOLVED] Code refactoring complete. Stability score: 98%");
    res.json(result);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FixIT Server running on http://localhost:${PORT}`);
  });

  // --- Chaos Monkey: Auto-trigger incidents every 30 seconds ---
  setInterval(() => {
    if (!systemState.isIncidentActive) {
      const incidentTypes = ["service_crash", "db_connection_error", "memory_leak"];
      const randomType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
      
      // We simulate a POST request to our own endpoint logic
      console.log(`[Chaos Monkey] Triggering auto-incident: ${randomType}`);
      
      systemState.isIncidentActive = true;
      systemState.lastIncidentType = randomType;

      if (randomType === "service_crash") {
        const service = systemState.services.find(s => s.id === "payment-service");
        if (service) {
          service.status = "crashed";
          service.cpu = 0;
          addLog("ERROR", "payment-service", "Fatal error: Uncaught exception in request handler. Service exited with code 1.");
          addLog("ERROR", "api-gateway", "Upstream payment-service returned 502 Bad Gateway.");
        }
      } else if (randomType === "db_connection_error") {
        const db = systemState.services.find(s => s.id === "db-cluster");
        if (db) {
          db.status = "degraded";
          addLog("ERROR", "db-cluster", "Connection pool exhausted. Max connections (100) reached.");
          addLog("ERROR", "auth-service", "Failed to acquire database connection. Timeout after 5000ms.");
        }
      } else if (randomType === "memory_leak") {
        const service = systemState.services.find(s => s.id === "auth-service");
        if (service) {
          service.status = "warning";
          service.memory = 850;
          addLog("WARN", "auth-service", "Memory usage critical: 850MB / 1024MB. GC overhead limit exceeded.");
        }
      }
    }
  }, 30000);
}

startServer();
