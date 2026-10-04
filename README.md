# boltapi

`boltapi` is an internal webhook receiver and buffer service built for capturing vendor logistics delivery status updates (e.g., status *surat jalan*, courier tracking, last-mile delivery callbacks). 

Incoming webhooks are immediately persisted into a local SQLite database file to avoid dropped updates during peak traffic or internal system downtime, then forwarded asynchronously to back-office ERP/WMS endpoints with exponential backoff retries.

## Features

- **Inbound Webhook Endpoint:** Captures incoming vendor callbacks with minimal response latency.
- **Local Buffer & Audit Log:** Stores raw payloads directly in SQLite (`boltapi.sqlite`) for reliable durability and auditability.
- **Background Relay Service:** Continuously polls and pushes unacknowledged events to target ERP/WMS HTTP endpoints with automatic retry count tracking.
- **Operational Management API:** Allows IT staff to query payload delivery state and trigger manual re-queueing for dead-letter items.

## Stack & Architecture

- **Runtime:** Bun 1.4
- **Language:** TypeScript 5.0
- **Database:** SQLite (via `bun:sqlite` native module)
- **Deployment:** Self-hosted systemd service on internal corporate VM behind an Nginx reverse proxy (TLS termination).

```
[ Logistics Vendor Callback ] 
            │
            ▼
  [ Nginx Reverse Proxy ]
            │
            ▼
   [ boltapi (Bun 1.4) ] ──► [ SQLite local db file ]
            │
            ▼ (Background Relay Agent)
  [ Internal ERP / WMS ]
```

## Quick Start

### Prerequisites

- [Bun 1.4+](https://bun.sh/)
- Linux VM or local dev environment

### Setup & Installation

1. Clone the repository to your working folder:
   ```bash
   git clone git@gitlab.internal.corp/logistics/boltapi.git
   cd boltapi
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables in `.env`:
   ```env
   PORT=3000
   DATABASE_PATH=./data/boltapi.sqlite
   ERP_FORWARD_URL=http://erp-internal.corp/api/v1/surat-jalan/webhook
   MAX_RETRIES=5
   ```

4. Initialize SQLite database schema:
   ```bash
   bun run src/db/migrate.ts
   ```

5. Run the service:
   ```bash
   # Development
   bun run --watch src/index.ts

   # Production
   bun run src/index.ts
   ```

## Systemd Deployment

For persistent VM deployment in the local data center:

1. Copy `boltapi.service` to `/etc/systemd/system/boltapi.service`.
2. Reload systemd daemon and enable service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now boltapi
   ```
3. Verify logs:
   ```bash
   journalctl -u boltapi -f
   ```
