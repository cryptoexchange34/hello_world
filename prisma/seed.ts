import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Initial tokens data
  const tokens = [
    { symbol: 'btcusdt', name: 'Bitcoin', price: 40000, change24h: 0.5 },
    { symbol: 'ethusdt', name: 'Ethereum', price: 3500, change24h: 1.2 },
    { symbol: 'bnbusdt', name: 'Binance Coin', price: 784, change24h: 0.2 },
    { symbol: 'solusdt', name: 'Solana', price: 150, change24h: -0.5 },
    { symbol: 'xrpusdt', name: 'Ripple', price: 0.5, change24h: -1.0 },
  ];

  for (const token of tokens) {
    await prisma.token.upsert({
      where: { symbol: token.symbol },
      update: {},
      create: token,
    });

    // Create initial price history data
    await prisma.priceHistory.create({
      data: {
        symbol: token.symbol,
        price: token.price,
      },
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 