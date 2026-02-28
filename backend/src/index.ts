import express from 'express';
import { greet } from '@/utils/test-helper';

const app = express();
const PORT = process.env.PORT || 3000;

// health check
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        message: greet('Developer')
    });
});


// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found'
        }
    });
});

// start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
