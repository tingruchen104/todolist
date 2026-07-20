#!/usr/bin/env bash
#
# 於目的地根目錄執行，背景啟動 prototype dev server（pnpm run serve:prototypes），
# 等到能連線後印出網址；逾時或啟動失敗則印出 log 並失敗。
# 以 PID 檔（存在專案外，不影響版本控管）記錄行程：重複執行時若行程還活著
# 就直接沿用、不重複啟動。只驗證 server 有回應，畫面內容由呼叫端另行確認。

set -euo pipefail

STATE_DIR="${TMPDIR:-/tmp}/prototype-dev-servers"
mkdir -p "$STATE_DIR"
PIDFILE="$STATE_DIR/$(printf '%s' "$PWD" | shasum -a 256 | cut -c1-16).pid"

# 重用既有、還活著的 server
if [ -f "$PIDFILE" ]; then
  PID="$(sed -n '1p' "$PIDFILE")"
  URL="$(sed -n '2p' "$PIDFILE")"
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "沿用既有：$URL（pid $PID）"
    exit 0
  fi
  rm -f "$PIDFILE"
fi

LOGFILE="$(mktemp)"
pnpm run serve:prototypes > "$LOGFILE" 2>&1 &
PID=$!

for _ in $(seq 1 30); do
  kill -0 "$PID" 2>/dev/null || break   # 行程已死，不用再等
  URL="$(grep -oE 'http://localhost:[0-9]+' "$LOGFILE" | head -1 || true)"
  if [ -n "$URL" ]; then
    printf '%s\n%s\n' "$PID" "$URL" > "$PIDFILE"
    echo "已啟動：$URL（pid $PID）"
    exit 0
  fi
  sleep 1
done

echo "dev server 未能在時限內就緒，log 如下：" >&2
cat "$LOGFILE" >&2
kill "$PID" 2>/dev/null || true
exit 1
