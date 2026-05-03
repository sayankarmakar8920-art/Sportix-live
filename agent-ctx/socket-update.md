# Task: socket-update — Chat Service Real-Time Feature Update

## Status: Completed

## Summary
Updated `/home/z/my-project/mini-services/chat-service/index.ts` to add 6 new real-time event handlers while preserving all 12 existing event handlers.

## New Data Structures Added
1. **`streamReactions`** — `Map<string, Map<string, number>>` — Tracks reaction counts per stream (streamId → type → count)
2. **`viewerSessions`** — `Map<string, Map<string, { userId, joinedAt }>>` — Tracks viewer sessions per stream room
3. **`streamHealthData`** — `Map<string, { bitrate, fps, startTime }>` — Tracks stream health metadata

## New Event Handlers
| Event | Direction | Description |
|-------|-----------|-------------|
| `reaction-add` | Client → Server → Room + Global | Increments reaction count, broadcasts to stream room with userId, then global broadcast without userId |
| `reaction-update` | Server → Room (every 5s) | Periodic emission of all reaction counts per stream |
| `ad-impression` | Client → Server | Logs impression data, acknowledges to sender with `ad-impression-ack` |
| `viewer-join` | Client → Server → Room | Tracks session, joins room, broadcasts updated viewer count |
| `viewer-leave` | Client → Server → Room | Removes session, broadcasts updated viewer count |
| `stream-health` | Server → Admin room (every 10s) | Broadcasts health data (viewerCount, bitrate, fps, uptime) for all active streams |

## Existing Events Preserved (unchanged)
- `join-stream`, `leave-stream`, `chat-message`, `admin-delete-message`, `admin-highlight-message`, `stream-status`, `admin-go-live` → `stream-went-live`, `admin-stop-live` → `stream-went-offline`, `admin-update-score` → `score-update`, `viewer-update` (5s interval), `disconnect`, `error`

## Key Design Decisions
- `viewer-update` interval was already at 5 seconds — kept as-is
- `reaction-update` interval set to 5 seconds to match
- `stream-health` interval set to 10 seconds as specified
- Viewer session cleanup on disconnect is not automatic (sessions use sessionId, not socket.id); clients should emit `viewer-leave` before disconnecting
- Stream health simulates small bitrate/fps fluctuations for realism
- Service remains on port 3005
