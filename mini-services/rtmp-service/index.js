/* eslint-disable @typescript-eslint/no-require-imports */
const NodeMediaServer = require("node-media-server");
const { mkdirSync, existsSync } = require("fs");
const { join } = require("path");

const RECORDINGS_DIR = join(__dirname, "../../recordings");
const HLS_DIR = join(__dirname, "../../public/hls");

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
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments+append_list]",
        dash: false,
      },
    ],
  },
};

const nms = new NodeMediaServer(config);

nms.on("prePublish", async (id, StreamPath, args) => {
  const streamKey = StreamPath.split("/").pop();
  console.log(`[RTMP] Pre-publish: ${StreamPath}, key: ${streamKey}`);

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
    }).catch(() => {});
  } catch (e) {
    /* ignore */
  }

  console.log(`[RTMP] Stream accepted: ${streamKey}`);
});

nms.on("donePublish", async (id, StreamPath, args) => {
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
    }).catch(() => {});
  } catch (e) {
    /* ignore */
  }
});

nms.on("prePlay", (id, StreamPath, args) => {
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

// Keep alive
setInterval(() => {
  // Simple heartbeat - prevents silent crashes
}, 30000);
