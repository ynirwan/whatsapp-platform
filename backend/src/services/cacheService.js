const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  /**
   * Set cache with expiration
   */
  static async set(key, value, expirationInSeconds = 3600) {
    try {
      await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
      logger.debug(`Cache set: ${key}`);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Get cache
   */
  static async get(key) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        logger.debug(`Cache hit: ${key}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete cache
   */
  static async del(key) {
    try {
      await redisClient.del(key);
      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.debug(`Cache deleted pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }
}

module.exports = CacheService;
