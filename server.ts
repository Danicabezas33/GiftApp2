import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API to list music files
  app.get("/api/music", (req, res) => {
    const isProd = process.env.NODE_ENV === "production" || fs.existsSync(path.join(process.cwd(), "dist"));
    const musicDir = isProd 
      ? path.join(process.cwd(), "dist", "music")
      : path.join(process.cwd(), "public", "music");
    
    console.log(`Checking music in: ${musicDir} (isProd: ${isProd})`);
    
    if (!fs.existsSync(musicDir)) {
      console.log("Music directory does not exist.");
      return res.json([]);
    }

    try {
      const files = fs.readdirSync(musicDir);
      // Filter for audio files (mp3, wav, etc)
      const audioFiles = files.filter(file => 
        [".mp3", ".wav", ".ogg", ".m4a"].includes(path.extname(file).toLowerCase())
      );
      res.json(audioFiles);
    } catch (error) {
      console.error("Error reading music directory:", error);
      res.status(500).json({ error: "Failed to read music" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
