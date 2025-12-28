import type { Express, Server } from "express";
import http from "http";
import { registerChatRoutes } from "./chat";
import compatibilityRouter from "./compatibility";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all API routes BEFORE static files
  registerChatRoutes(app);
  app.use("/api/compatibility", compatibilityRouter);
  
  // Add more route registrations here as needed
  
  // Create and return the HTTP server
  const server = http.createServer(app);
  return server;
}