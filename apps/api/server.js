// Load environment variables from .env file
import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes.canonical";
// Simple logger function
function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
const app = express();
// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Add /health endpoint for health checks
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
(async () => {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    const PORT = parseInt(process.env.PORT || "5000", 10);
    server.listen(PORT, "0.0.0.0", () => {
        log(`SoulCodex API serving on port ${PORT}`);
    });
})();
