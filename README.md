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

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://127.0.0.1:5173
```

Stop the development server with `Ctrl+C`.

## Create a production build

```bash
npm run build
```

The optimized files will be written to `dist/`.

To preview that build locally:

```bash
npm run preview
```

## Where to make changes

- `src/App.tsx` — page layout and refresh interaction
- `src/mockData.ts` — mock instance, chart, metric and alarm data
- `src/styles.css` — dashboard styling and responsive layout
- `src/components/` — reusable sidebar, metric-card and chart components

## Current scope

- Instance identity and running state
- CPU, memory, disk and health summary cards
- CPU and network history charts
- Instance configuration details
- Status checks and alarms
- Responsive desktop and mobile layouts

The next development step is to replace `src/mockData.ts` with API requests to
the monitoring backend.
