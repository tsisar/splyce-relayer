# Splyce Relayer

**Splyce Relayer** is a service for processing, monitoring, and recovering VAA (Verified Action Approval) messages in the Wormhole network, with integration for Solana and other chains. The project includes a Node.js/TypeScript backend, REST API, a web interface for viewing and manual VAA recovery, and supports deployment via Docker and Kubernetes.

## Features

- **VAA Processing**: Automatic reception, filtering, and processing of VAAs via Wormhole Relayer Engine.
- **Storage**: Uses PostgreSQL to store VAA history.
- **Queue & Cache**: Integrates with Redis for job queuing and caching.
- **Web Interface**: UI for viewing VAAs, manual recovery, and transaction inspection.
- **Notifications**: Supports Telegram and Slack for event/error notifications.
- **Flexible Configuration**: Environment-based configuration for dev/prod.
- **Kubernetes & Docker**: Ready-to-use manifests for deployment.

## Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Configure environment variables** (see examples in `k8s/relayer.yaml` or use a `.env` file).

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Web UI** will be available at: [http://localhost:3000](http://localhost:3000)

### Docker Build & Run

```bash
./build_and_push.sh
# or manually:
docker build -t splyce-relayer:latest .
docker run -p 3000:3000 --env-file .env splyce-relayer:latest
```

### Kubernetes Deployment

Use the manifests in the `k8s/` directory to deploy in your cluster.

## Project Structure

- `src/` — main code:
  - `relayer.ts` — VAA processing logic via Wormhole Relayer Engine.
  - `web-server.ts` — REST API and web server for the UI.
  - `pg-storage/` — PostgreSQL integration.
  - `redis/` — Redis integration.
  - `notification/` — notification integrations.
  - `provider/` — external chain/service integrations.
  - `logger/` — custom logging.
- `web/` — static web UI (HTML, CSS, JS).
- `k8s/` — Kubernetes manifests.
- `Dockerfile`, `build_and_push.sh` — Docker image build and deployment scripts.

## API

- `GET /api/vaas` — get a paginated list of VAAs
- `GET /api/vaa-tx` — get transactions for a specific VAA
- `POST /api/recover-vaa` — manually trigger VAA recovery

## Web UI

- View latest VAAs, statuses, and transactions
- Manual VAA recovery via modal dialog
- Pagination support

## Dependencies

- Node.js, TypeScript
- Express, PostgreSQL, Redis
- Wormhole SDK, Relayer Engine
- Winston (logging)
- Bootstrap (UI)
