---
Task ID: 2
Agent: Main Agent
Task: Create RTMP/HLS streaming mini-service

Work Log:
- Created `/home/z/my-project/mini-services/rtmp-service/` directory structure
- Created `package.json` with node-media-server v2.7.0 dependency
- Created `index.ts` (TypeScript source) with full RTMP server implementation
- Created `index.js` (CommonJS runtime) for Node.js execution (node-media-server is CJS-only)
- Created `scripts/postinstall.sh` for auto-patching node-media-server v2.7.x bug
- Installed dependencies with `bun install` (84 packages)
- Created directories: `/home/z/my-project/recordings/` and `/home/z/my-project/public/hls/`
- Patched node-media-server v2.7.4 bug: `getFFmpegVersion` was imported but not defined in `node_core_utils.js`, causing `ReferenceError: version is not defined` in `node_trans_server.js`
- Verified service starts successfully with all 4 servers:
  - RTMP server on port 1935 ✅
  - HTTP/HLS server on port 8000 ✅
  - WebSocket server on port 8000 ✅
  - Health check server on port 8001 ✅
- Verified ffmpeg 7.1.3 is installed and detected by the trans server

Key Implementation Details:
- RTMP accepts streams from OBS on `rtmp://localhost:1935/live/{streamKey}`
- HLS transcoding via ffmpeg: 2s segments, 3-segment playlist, auto-delete old segments
- Auto-creates recording directories per stream key at `/recordings/{streamKey}/`
- Stream events (publish/donePublish) sent via HTTP callback to Next.js `/api/streams/rtmp-event`
- Stream key validation placeholder (accepts any key, ready for DB integration)
- Health check at `/health` on port 8001 returns `{status, service, uptime}`
- Uses `node index.js` instead of `bun` due to node-media-server CJS compatibility

Runtime Note:
- Package scripts use `node index.js` (not `bun`) because node-media-server uses CommonJS requires
- In the sandbox, the service must be started with `node index.js &` in a shell session
- Sandbox process management may kill detached background processes; service runs when started within an active shell session
