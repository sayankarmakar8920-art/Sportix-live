#!/bin/bash
# Post-install: patch node-media-server v2.7.x bug where 'version' is undefined
# in node_trans_server.js line 45
PATCH_FILE="node_modules/node-media-server/src/node_trans_server.js"

if [ -f "$PATCH_FILE" ]; then
  if rg -q "getFFmpegVersion, getFFmpegUrl" "$PATCH_FILE" 2>/dev/null; then
    echo "[patch] Fixing node-media-server getFFmpegVersion bug..."
    sed -i "s|const { getFFmpegVersion, getFFmpegUrl } = require('./node_core_utils');|const { execSync } = require('child_process');|" "$PATCH_FILE"
    sed -i "s|ffmpeg version: \${version}|ffmpeg version: unknown (patched)|" "$PATCH_FILE"
    echo "[patch] Done."
  else
    echo "[patch] Already patched or different version, skipping."
  fi
fi
