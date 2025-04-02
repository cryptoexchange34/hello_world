# Crypto Trading Panel

A real-time cryptocurrency trading panel built with Next.js 15, featuring live price updates, interactive charts, and a trading interface.

## Features

- Real-time price updates for top cryptocurrencies
- Interactive trading chart with candlestick patterns
- Buy/Sell interface with order book
- WebSocket integration for live data
- PostgreSQL database for data persistence

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (NeonDB account)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-trading-panel
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
DATABASE_URL="your_neon_database_url"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
BINANCE_API_URL="wss://stream.binance.com:9443/ws"
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
```

4. Initialize the database:
```bash
npx prisma db push
```

5. Seed the database with initial data (optional):
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

## Windows-Specific Setup

For Windows users, make sure you have all directories created:

```powershell
mkdir -Force prisma
mkdir -Force src 
mkdir -Force src\websocket
mkdir -Force src\app
mkdir -Force src\app\api
mkdir -Force src\components
```

If you encounter any issues with the WebSocket connection, you can modify the `.env` file and use a different port or use a third-party service like ngrok to expose your local server.

## Architecture

- **Frontend**: Next.js 15 with App Router and React Server Components
- **Backend**: Next.js API Routes and WebSocket server
- **Database**: PostgreSQL (NeonDB)
- **Real-time Updates**: Socket.IO and WebSocket
- **Styling**: Tailwind CSS

## Troubleshooting

- If you encounter database connection issues, make sure your NeonDB URL is correct and that you've properly set up the `.env` file.
- If WebSocket connections fail, the app will fallback to using mock data.
- For Windows users, make sure to use the `cross-env` package for environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
