import express from 'express';
import cors from 'cors';
import apicache from 'apicache'

import getConfig from './api/utils/getConfig.js';
import proxyRouter from './api/middlewares/proxyRouter.js';

import authenticate from './api/middlewares/authenticate.js';
import rateLimiter from './api/middlewares/rateLimiter.js';
import incomingLogger from './api/middlewares/incomingLogger.js';
import outgoingLogger from './api/middlewares/outgoingLogger.js';
import errorHandler from './api/middlewares/errorHandler.js'


export const gateway = async (req, res) => {
    const app = express();
    const jsonParser = express.json({ limit: '50mb' });
    const config = await getConfig();
    const cache = apicache.middleware(config.apicache)
    const incomingLog = incomingLogger(config)
    const outgoingLog = outgoingLogger(config)
    const rateLimit = rateLimiter(config.rateLimit)

    app.use(jsonParser)
    app.use(cors());
    app.use(cache);
    app.use(incomingLog); // Logging middleware for requests
    app.use(outgoingLog); // Logging middleware for responses
    app.use('/v1', authenticate); // Authenticator middleware for '/api' route
    app.use('/demo', rateLimit); // Rate limiter middleware for '/demo' route
    app.use(['/v1', '/demo'], proxyRouter); // Proxy router middleware
    app.use(errorHandler); // Error Handler middleware

    app(req, res);
}






