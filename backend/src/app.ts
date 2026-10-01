import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './routes/auth.routes';
import masterDataRoutes from './routes/masterData.routes';
import p2pRoutes from './routes/p2p.routes';
import o2cRoutes from './routes/o2c.routes';
import exceptionRoutes from './routes/exception.routes';
import analyticsRoutes from './routes/analytics.routes';

export const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Request logger in development
if (config.nodeEnv !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Enterprise P2P & O2C Digital Control Tower Backend',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api', masterDataRoutes);
app.use('/api', p2pRoutes);
app.use('/api', o2cRoutes);
app.use('/api', exceptionRoutes);
app.use('/api', analyticsRoutes);

// 404 Not Found Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.originalUrl}' does not exist on this server.`,
    },
  });
});

// Global Error Handler
app.use(errorHandler);

// Start HTTP Server if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`================================================================`);
    console.log(`🏢 SAP MM/SD Process Simulation & Digital Control Tower Server`);
    console.log(`📡 Listening on http://localhost:${config.port}`);
    console.log(`🌐 Frontend Origin allowed: ${config.frontendUrl}`);
    console.log(`================================================================`);
  });
}
