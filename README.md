# Planning Poker

A real-time planning poker application for agile teams with a modern, responsive interface and robust features.

![Planning Poker Screenshot](https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80)

## Features

- 🎮 Real-time voting system with confidence indicators
- ⏱️ Configurable timer for voting sessions
- 👥 Support for multiple players with take-over functionality
- 📊 Detailed voting statistics and consensus tracking
- 🎯 Confidence level indicators for each vote
- 📈 Sprint and story point history tracking
- 🌓 Dark mode support
- 🔄 Automatic state synchronization
- 🚀 Optimized for performance
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **State Management**: Zustand
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library + Playwright
- **Deployment**: Docker + Kubernetes + Kargo
- **Environment**: Configurable through environment variables

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 9.x or later
- Docker (optional, for containerized deployment)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/planning-poker.git
   cd planning-poker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. Build and run with docker-compose:
   ```bash
   docker-compose up --build
   ```

2. Or build and run with Docker directly:
   ```bash
   docker build \
     --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
     --build-arg NEXT_PUBLIC_APP_NAME="Your App Name" \
     -t planning-poker .

   docker run -p 3000:80 \
     -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
     -e NEXT_PUBLIC_APP_NAME="Your App Name" \
     planning-poker
   ```

## Development

### Project Structure

```
planning-poker/
├── app/                   # Next.js app directory
├── components/            # React components
│   ├── ui/               # UI components from shadcn/ui
│   └── playing-cards/    # Game-specific components
├── lib/                  # Utilities and store
├── __tests__/           # Unit tests
├── e2e/                 # E2E tests
├── k8s/                 # Kubernetes manifests
├── helm/                # Helm charts
└── kargo/               # Kargo configuration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:smoke` - Run smoke tests
- `npm run test:ci` - Run all tests (CI environment)
- `npm run lint` - Run ESLint

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Application URL | http://localhost:3000 |
| `NEXT_PUBLIC_APP_NAME` | Application name | Planning Poker |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Application description | A real-time planning poker application... |
| `NEXT_PUBLIC_API_URL` | API endpoint | http://localhost:3000/api |
| `NEXT_PUBLIC_AUTH_ENABLED` | Enable authentication | false |
| `NEXT_PUBLIC_ENABLE_DARK_MODE` | Enable dark mode | true |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | false |

### Testing

The project uses a comprehensive testing strategy:

1. **Unit Tests** (Vitest + React Testing Library)
   - Component tests
   - Store tests
   - Utility tests

2. **E2E Tests** (Playwright)
   - User flow tests
   - Smoke tests
   - Cross-browser testing

Run tests:
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Smoke tests
npm run test:smoke

# All tests with coverage
npm run test:coverage
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

See [DOCKER.md](DOCKER.md) for detailed container deployment instructions.

### Kubernetes Deployment

1. Apply Kubernetes manifests:
   ```bash
   kubectl apply -k k8s/overlays/production
   ```

2. Deploy using Helm:
   ```bash
   helm install planning-poker ./helm/planning-poker
   ```

### Monitoring

- Prometheus metrics available at `/metrics`
- Grafana dashboards included in Helm chart
- Health check endpoint at `/health`

## License