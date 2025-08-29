import { createClient } from 'redis';
import { logger } from './logger.js';

let redisClient = null;

// Initialize Redis connection
export async function initRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    logger.info('Redis initialized successfully');
  } catch (error) {
    logger.error('Redis initialization failed:', error);
    throw error;
  }
}

// Get Redis client
export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

// Set key-value pair with optional expiration
export async function setKey(key, value, expiration = null) {
  try {
    const client = getRedisClient();
    if (expiration) {
      await client.setEx(key, expiration, JSON.stringify(value));
    } else {
      await client.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    logger.error('Redis setKey error:', error);
    return false;
  }
}

// Get value by key
export async function getKey(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis getKey error:', error);
    return null;
  }
}

// Delete key
export async function deleteKey(key) {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Redis deleteKey error:', error);
    return false;
  }
}

// Set hash field
export async function setHashField(key, field, value) {
  try {
    const client = getRedisClient();
    await client.hSet(key, field, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis setHashField error:', error);
    return false;
  }
}

// Get hash field
export async function getHashField(key, field) {
  try {
    const client = getRedisClient();
    const value = await client.hGet(key, field);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Redis getHashField error:', error);
    return null;
  }
}

// Get all hash fields
export async function getHashAll(key) {
  try {
    const client = getRedisClient();
    const hash = await client.hGetAll(key);
    const result = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }
    return result;
  } catch (error) {
    logger.error('Redis getHashAll error:', error);
    return {};
  }
}

// Add to sorted set
export async function addToSortedSet(key, score, member) {
  try {
    const client = getRedisClient();
    await client.zAdd(key, { score, value: JSON.stringify(member) });
    return true;
  } catch (error) {
    logger.error('Redis addToSortedSet error:', error);
    return false;
  }
}

// Get range from sorted set
export async function getSortedSetRange(key, start = 0, stop = -1, withScores = false) {
  try {
    const client = getRedisClient();
    if (withScores) {
      const result = await client.zRangeWithScores(key, start, stop);
      return result.map(item => ({
        member: JSON.parse(item.value),
        score: item.score
      }));
    } else {
      const result = await client.zRange(key, start, stop);
      return result.map(item => JSON.parse(item));
    }
  } catch (error) {
    logger.error('Redis getSortedSetRange error:', error);
    return [];
  }
}

// Increment counter
export async function incrementCounter(key, amount = 1) {
  try {
    const client = getRedisClient();
    return await client.incrBy(key, amount);
  } catch (error) {
    logger.error('Redis incrementCounter error:', error);
    return null;
  }
}

// Set key with expiration if not exists
export async function setKeyIfNotExists(key, value, expiration = null) {
  try {
    const client = getRedisClient();
    const result = await client.setNX(key, JSON.stringify(value));
    if (result && expiration) {
      await client.expire(key, expiration);
    }
    return result;
  } catch (error) {
    logger.error('Redis setKeyIfNotExists error:', error);
    return false;
  }
}

// Cache wrapper function
export async function cacheWrapper(key, fetchFunction, expiration = 3600) {
  try {
    // Try to get from cache first
    const cached = await getKey(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and store
    const data = await fetchFunction();
    await setKey(key, data, expiration);
    return data;
  } catch (error) {
    logger.error('Cache wrapper error:', error);
    // Fallback to direct fetch
    return await fetchFunction();
  }
}

// Clear cache by pattern
export async function clearCacheByPattern(pattern) {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      logger.info(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
    }
    return keys.length;
  } catch (error) {
    logger.error('Redis clearCacheByPattern error:', error);
    return 0;
  }
}

// Close Redis connection
export async function closeRedis() {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

// Health check for Redis
export async function redisHealthCheck() {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}
