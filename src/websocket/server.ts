import { Server } from 'socket.io';
import { WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client with error handling
let prisma: PrismaClient;
let dbConnected = false;

// Check if we should skip database operations
const skipDb = process.env.SKIP_DB === 'true';

try {
  if (skipDb) {
    console.log('Database operations are skipped based on SKIP_DB flag');
    // Create a mock Prisma client
    prisma = {} as PrismaClient;
    
    // Override methods with mock implementations
    (prisma as any).token = {
      upsert: async () => {
        console.log('[MOCK] Token upsert called');
        return {} as any;
      }
    };
    
    (prisma as any).priceHistory = {
      create: async () => {
        console.log('[MOCK] PriceHistory create called');
        return {} as any;
      }
    };
  } else {
    prisma = new PrismaClient();
    dbConnected = true;
    console.log('Database connection established');
  }
} catch (error) {
  console.error('Failed to connect to database:', error);
  // Create a mock Prisma client when DB connection fails
  prisma = {} as PrismaClient;
  
  // Override methods with mock implementations
  (prisma as any).token = {
    upsert: async () => {
      console.log('Mock token upsert called');
      return {} as any;
    }
  };
  
  (prisma as any).priceHistory = {
    create: async () => {
      console.log('Mock priceHistory create called');
      return {} as any;
    }
  };
}

const BINANCE_WS_URL = process.env.BINANCE_API_URL || 'wss://stream.binance.com:9443/ws';
const SYMBOLS = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt'];

export function setupWebSocketServer(httpServer: any) {
  console.log('Setting up WebSocket server...');
  
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  try {
    const binanceWs = new WebSocket(BINANCE_WS_URL);

    binanceWs.on('open', () => {
      console.log('Connected to Binance WebSocket');
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: SYMBOLS.map(symbol => `${symbol}@ticker`),
        id: 1
      };
      binanceWs.send(JSON.stringify(subscribeMsg));
    });

    binanceWs.on('message', async (data: any) => {
      try {
        const parsedData = JSON.parse(data.toString());
        if (parsedData.s && parsedData.p) {
          const symbol = parsedData.s.toLowerCase();
          const price = parseFloat(parsedData.p);
          const change24h = parseFloat(parsedData.P);

          console.log(`Received price update for ${symbol}: $${price}`);

          // Emit to connected clients - do this first to ensure UI updates
          io.emit('price-update', { symbol, price, change24h });

          // Update database only if connected
          if (dbConnected) {
            try {
              // Update database
              await prisma.token.upsert({
                where: { symbol },
                update: { price, change24h },
                create: {
                  symbol,
                  name: symbol.toUpperCase(),
                  price,
                  change24h
                }
              });

              // Store price history
              await prisma.priceHistory.create({
                data: {
                  symbol,
                  price
                }
              });
            } catch (error) {
              console.error('Database operation error:', error);
              // If we encounter DB errors, mark as disconnected to avoid future attempts
              dbConnected = false;
            }
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    binanceWs.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    binanceWs.on('close', () => {
      console.log('Binance WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect to Binance WebSocket...');
        setupWebSocketServer(httpServer);
      }, 5000);
    });

    io.on('connection', (socket) => {
      console.log('Client connected');
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    return io;
  } catch (error) {
    console.error('Error setting up WebSocket server:', error);
    return new Server();
  }
} 