// ── Server-Sent Events hub, keyed by run_id ────────────────────
// The Live Agent Console subscribes to /api/runs/:id/stream and receives
// every RunEvent in real time (no polling).

const channels = new Map(); // run_id -> Set<res>

export function subscribe(runId, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });
  res.write('retry: 3000\n\n');

  let set = channels.get(runId);
  if (!set) {
    set = new Set();
    channels.set(runId, set);
  }
  set.add(res);

  const keepAlive = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      /* ignore */
    }
  }, 25000);

  res.on('close', () => {
    clearInterval(keepAlive);
    const s = channels.get(runId);
    if (s) {
      s.delete(res);
      if (s.size === 0) channels.delete(runId);
    }
  });
}

export function publish(runId, event) {
  const set = channels.get(runId);
  if (!set || set.size === 0) return;
  const data = `event: ${event.type || 'message'}\ndata: ${JSON.stringify(event)}\n\n`;
  for (const res of set) {
    try {
      res.write(data);
    } catch {
      /* client gone */
    }
  }
}

export function hasSubscribers(runId) {
  const set = channels.get(runId);
  return Boolean(set && set.size > 0);
}
