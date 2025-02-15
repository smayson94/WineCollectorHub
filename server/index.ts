import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const startApp = async () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Add health check endpoint
  app.get('/health', (_req, res) => {
    log('Health check endpoint called');
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Add more detailed logging
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api") || path === '/health') {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Register API routes first
  registerRoutes(app);
  const server = createServer(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Setup Vite or serve static files
  if (process.env.NODE_ENV === "development") {
    log('Setting up Vite middleware for development...');
    await setupVite(app, server);
    log('Vite middleware setup complete');
  } else {
    log('Setting up static file serving for production...');
    serveStatic(app);
  }

  const startServer = (port: number) => {
    return new Promise<number>((resolve, reject) => {
      server.listen(port, "0.0.0.0", () => {
        const addressInfo = server.address();
        const actualPort = typeof addressInfo === 'object' && addressInfo ? addressInfo.port : port;
        log(`Server listening on 0.0.0.0:${actualPort}`);
        resolve(actualPort);
      }).on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          log(`Port ${port} is in use, trying next available port...`);
          server.close();
          startServer(port + 1).then(resolve).catch(reject);
        } else {
          console.error('Server error:', error);
          reject(error);
        }
      });
    });
  };

  const PORT = Number(process.env.PORT) || 3001;
  log(`Attempting to start server on port ${PORT}...`);

  try {
    await startServer(PORT);

    // Handle graceful shutdown
    const shutdown = () => {
      log('Performing graceful shutdown...');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startApp().catch((error) => {
  console.error('Fatal error during app startup:', error);
  process.exit(1);
});