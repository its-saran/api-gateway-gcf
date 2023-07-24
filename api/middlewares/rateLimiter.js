import rateLimit from 'express-rate-limit';

const rateLimiter = (config) => {
  const limiter = rateLimit({
    windowMs: config.perMinutes * 60 * 1000, 
    max: config.maxRequests,
  });

  return limiter;
};

export default rateLimiter;