# EC2 Monitor Dashboard

A responsive React and TypeScript dashboard for an EC2 monitoring project. This
first version uses mock data, so it can be developed without a backend or AWS
credentials.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

Check your installed versions:

```bash
node --version
npm --version
```

## Run locally

Install the frontend dependencies:

```bash
npm install
```

Install the backend dependencies:

```bash
cd backend
npm install
cd ..
```

### Start the API

In the first terminal:

```bash
npm run dev:backend
```

The Express API will start at:

```text
http://127.0.0.1:3000
```

Test it in a browser or with curl:

```bash
curl http://127.0.0.1:3000/api/health
```

### Start the React dashboard

In a second terminal:

```bash
npm run dev:frontend
```

Open the URL printed by Vite, normally:

```text
http://127.0.0.1:5173
```

Stop the development server with `Ctrl+C`.

During local development, Vite forwards requests beginning with `/api` to the
Express server on port 3000. This means React can call `/api/health` without
hard-coding a host or configuring CORS.

## API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api` | Lists available endpoints |
| GET | `/api/health` | API health and process uptime |
| GET | `/api/system` | Local operating system and processor details |
| GET | `/api/instance` | Mock EC2 instance information |
| GET | `/api/metrics/summary` | Live CPU, memory, disk, network and uptime metrics |
| GET | `/api/metrics/history?range=1h` | Rolling live metric history |
| GET | `/api/alarms` | Alarm states calculated from live metrics |

Supported history ranges are `1h`, `6h`, `24h`, and `7d`.

## Live local metrics

The Express API measures the machine on which its process is running. During
local development it therefore reports metrics from your local PC. After the
backend is deployed to EC2, the same endpoints will report metrics from that
Ubuntu instance.

The API collects:

- Current total, user, and system CPU utilization
- Logical CPU core count
- Used, available, and total memory
- Primary filesystem usage and available space
- Network receive and transmit rates
- System uptime
- Hostname, operating system, kernel, architecture, and processor model

Metric responses are cached for two seconds to avoid duplicate system reads.
Each fresh collection is added to an in-memory rolling history. This history
resets when the backend restarts; use CloudWatch or a database later if metric
history must survive restarts.

The EC2 identity returned by `/api/instance` remains mock data for now. Only its
uptime is read from the local system. Genuine instance ID, type, region, and IP
details will be added when the backend is running on EC2.

## Create a production build

Build the frontend:

```bash
npm run build
```

The optimized files will be written to `dist/`.

Build the backend:

```bash
npm run build:backend
```

The compiled API files will be written to `backend/dist/`. Start the compiled
API with:

```bash
cd backend
npm start
```

To preview that build locally:

```bash
npm run preview
```

## Where to make changes

- `src/App.tsx` — page layout and refresh interaction
- `src/api.ts` — typed client for all Express monitoring endpoints
- `src/styles.css` — dashboard styling and responsive layout
- `src/components/` — reusable sidebar, metric-card and chart components
- `backend/src/app.ts` — Express middleware and route registration
- `backend/src/routes/` — API route handlers
- `backend/src/services/systemMetrics.ts` — live system metric collection
- `backend/src/services/alarms.ts` — live alarm threshold calculations
- `backend/src/data/mockData.ts` — temporary mock EC2 identity
- `vite.config.ts` — frontend development proxy configuration

## Current scope

- Instance identity and running state
- CPU, memory, disk and health summary cards
- CPU and network history charts
- Instance configuration details
- Status checks and alarms
- Loading, retry, manual refresh, and API error states
- Automatic live refresh every 15 seconds
- Responsive desktop and mobile layouts

The frontend now loads system information, instance identity, metric summaries,
rolling history, and alarms from Express. During development these requests use
Vite's `/api` proxy. In production, Nginx will forward the same paths to the
backend, so no frontend API URL needs to change.
