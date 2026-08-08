import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const redisUrl = process.env.REDIS_URL;

export const connection = redisUrl
  ? new Redis(redisUrl, { maxRetriesPerRequest: null, tls: undefined })
  : new Redis({
      host: process.env.REDIS_HOST || 'valkey',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });

connection.on('error', (err) => {
  console.error('Redis Client Error:', err);
});
