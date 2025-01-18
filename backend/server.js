import express from 'express';
    import cors from 'cors';
    import dotenv from 'dotenv';
    import authRoutes from './routes/auth.js';
    import userRoutes from './routes/users.js';
    import stripeRoutes from './routes/stripe.js';
    import { initDb } from './db/database.js';
    import crypto from 'crypto';

    // Load environment variables
    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 5000;

    // CORS configuration
    app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
      credentials: true
    }));

    // Debug logging middleware - log all requests
    app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      console.log('Headers:', req.headers);
      next();
    });

    // IMPORTANT: Raw body parsing for Stripe webhooks
    // This must come BEFORE any other body parsers
    app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

    // Regular body parsing for other routes
    app.use(express.json());

    // Initialize database
    initDb();

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/stripe', stripeRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok',
        webhookSecretPresent: !!process.env.STRIPE_WEBHOOK_SECRET,
        stripeSecretPresent: !!process.env.STRIPE_SECRET_KEY
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });
      
      res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
      });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment Check:', {
        webhookSecretPresent: !!process.env.STRIPE_WEBHOOK_SECRET,
        stripeSecretPresent: !!process.env.STRIPE_SECRET_KEY,
        port: PORT
      });
    });
