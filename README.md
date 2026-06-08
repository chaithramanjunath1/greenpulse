# GreenPulse — Personal Carbon Impact Monitor

> **Understand, track, and reduce your carbon footprint through simple daily actions and personalized insights.**

GreenPulse is a full-stack web application built with React + Vite (frontend) and Express.js (backend). It helps individuals monitor their carbon emissions across four sectors — transportation, diet, energy, and shopping — and provides AI-powered personalized advice for reduction.

## Features

- **Understand**: Visualize your carbon footprint broken down by lifestyle sector with interactive charts
- **Track**: Log daily activities and view your emission history over time
- **Reduce**: Get personalized action plans with effort-based prioritization and AI-powered tips via Google Gemini
- **Accessible**: WCAG AA compliant with full keyboard navigation and ARIA attributes
- **Secure**: helmet, CORS, rate limiting, compression, and no hardcoded API keys

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Express.js (Node 20+) |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Styling | Vanilla CSS (glassmorphism dark theme) |
| Testing | Vitest + v8 coverage |
| Linting | ESLint with prop-types enforcement |

## Getting Started

```bash
# Install dependencies
npm install

# Start development (server + client concurrently)
npm run dev

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Production build
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
PORT=3001
```

> **Note**: The app works without a Gemini API key using mock advice responses.

## Project Structure

```
greenpulse/
├── src/
│   ├── algorithms/      # Pure calculation functions (100% tested)
│   ├── connectors/      # API communication layer
│   ├── design/          # CSS design system + animations
│   ├── flux/            # State management (useReducer + Context)
│   ├── viewports/       # Page-level view components
│   ├── widgets/         # Reusable UI components
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── server/
│   ├── app.js           # Express server with security middleware
│   ├── carbon-routes.js # API endpoints
│   ├── carbon-advisor.js # Gemini AI integration
│   └── validation-rules.js # Input validation
├── index.html
├── vite.config.js
├── vitest.config.js
└── eslint.config.js
```

## Deployment

Build the Docker image and deploy to Google Cloud Run:

```bash
docker build -t greenpulse .
docker run -p 3001:3001 -e GEMINI_API_KEY=your_key greenpulse
```

## License

MIT
