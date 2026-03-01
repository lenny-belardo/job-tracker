import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import logger from '@/utils/logger';
import { greet } from '@/utils/test-helper';

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get('/health', (_req, res) => {
    logger.debug('Health check endpoint called');

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        message: greet('Developer')
    });
});

// 404 handler
app.use((_req, res) => {
    logger.warn(`404 - Route not found: ${_req.method} ${_req.path}`);

    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found'
        }
    });
});

// start server
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
