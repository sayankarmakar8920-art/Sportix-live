import NodeMediaServer from "node-media-server";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import { createServer } from "http";

const RECORDINGS_DIR = join(process.cwd(), "../../recordings");
const HLS_DIR = join(process.cwd(), "../../public/hls");

// Ensure directories exist
if (!existsSync(RECORDINGS_DIR)) mkdirSync(RECORDINGS_DIR, { recursive: true });
if (!existsSync(HLS_DIR)) mkdirSync(HLS_DIR, { recursive: true });

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 60,
    ping_timeout: 30,
  },
  http: {
    port: 8000,
    allow_origin: "*",
    mediaroot: HLS_DIR,
  },
  trans: {
    ffmpeg: "/usr/bin/ffmpeg",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags:
          "[hls_time=2:hls_list_size=3:hls_flags=delete_segments+append_list]",
        dash: false,
        dashFlags: "[f=dash:window_size=3:extra_window_size=5]",
      },
    ],
  },
};

// Valid stream keys (in production, check against database)
const validKeys = new Set<string>();
// Admin can add stream keys via API

const nms = new (NodeMediaServer as any)(config);

nms.on("prePublish", async (id: string, StreamPath: string, args: any) => {
  const streamKey = StreamPath.split("/").pop();
  console.log(`[RTMP] Pre-publish: ${StreamPath}, key: ${streamKey}`);

  // In production, validate streamKey against database
  // For now, accept any stream key
  if (!streamKey) {
    console.log(`[RTMP] Rejected - no stream key`);
    return false;
  }

  // Create recording directory
  const recDir = join(RECORDINGS_DIR, streamKey || "default");
  if (!existsSync(recDir)) mkdirSync(recDir, { recursive: true });

  // Notify Next.js app that stream is going live
  try {
    await fetch("http://localhost:3000/api/streams/rtmp-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "publish",
        streamKey,
        streamPath: StreamPath,
        id,
      }),
    }).catch(() => {
      /* ignore */
    });
  } catch {
    /* ignore */
  }

  console.log(`[RTMP] Stream accepted: ${streamKey}`);
});

nms.on("donePublish", async (id: string, StreamPath: string, args: any) => {
  const streamKey = StreamPath.split("/").pop();
  console.log(`[RTMP] Stream ended: ${streamKey}`);

  // Notify Next.js app
  try {
    await fetch("http://localhost:3000/api/streams/rtmp-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "donePublish",
        streamKey,
        streamPath: StreamPath,
        id,
      }),
    }).catch(() => {
      /* ignore */
    });
  } catch {
    /* ignore */
  }
});

nms.on("prePlay", (id: string, StreamPath: string, args: any) => {
  console.log(`[RTMP] Play request: ${StreamPath}`);
  return true;
});

// Start server
nms.run();
console.log(`
╔══════════════════════════════════════════╗
║   Sportix Live - RTMP/HLS Server        ║
║   RTMP:  rtmp://localhost:1935/live     ║
║   HLS:   http://localhost:8000/live/     ║
║   Recordings: ${RECORDINGS_DIR}     ║
╚══════════════════════════════════════════╝
`);

// Health check endpoint (simple HTTP)
const healthServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "rtmp",
        uptime: process.uptime(),
      })
    );
  } else {
    res.writeHead(404);
    res.end();
  }
});
healthServer.listen(8001, () => {
  console.log("[RTMP] Health check on port 8001");
});
