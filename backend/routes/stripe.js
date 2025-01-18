import express from 'express';
    import Stripe from 'stripe';
    import { dbRun } from '../db/database.js';

    const router = express.Router();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Define package amounts and their corresponding token values
    const PACKAGE_TOKENS = {
      199: 42,    // Starter package ($1.99)
      499: 155,   // Professional package ($4.99)
      999: 400    // Enterprise package ($9.99)
    };

    const logWebhookData = (req) => {
      console.log('\n=== Webhook Request Details ===');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Method:', req.method);
      console.log('Path:', req.path);
      console.log('\nHeaders:');
      console.log(JSON.stringify(req.headers, null, 2));
      console.log('\nStripe Signature:', req.headers['stripe-signature']);
      console.log('\nBody Type:', typeof req.body);
      console.log('Body is Buffer:', Buffer.isBuffer(req.body));
      if (Buffer.isBuffer(req.body)) {
        console.log('Body Length:', req.body.length);
        console.log('Body Preview:', req.body.toString('utf8').substring(0, 100) + '...');
      } else {
        console.log('Body:', req.body);
      }
      console.log('\nEnvironment:');
      console.log('Webhook Secret Present:', !!process.env.STRIPE_WEBHOOK_SECRET);
      console.log('Webhook Secret Length:', process.env.STRIPE_WEBHOOK_SECRET?.length);
      console.log('=== End Webhook Request Details ===\n');
    };

    router.post('/webhook', async (req, res) => {
      try {
        logWebhookData(req);

        const sig = req.headers['stripe-signature'];
        
        if (!sig) {
          console.error('No Stripe signature found in headers');
          return res.status(400).json({ error: 'No Stripe signature found' });
        }

        if (!process.env.STRIPE_WEBHOOK_SECRET) {
          console.error('No webhook secret found in environment variables');
          return res.status(500).json({ error: 'Webhook secret not configured' });
        }

        let event;
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
          console.log('Successfully constructed webhook event:', event.type);
        } catch (err) {
          console.error('Failed to construct webhook event:', err.message);
          return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          console.log('Processing checkout session:', {
            sessionId: session.id,
            customerId: session.customer,
            clientReferenceId: session.client_reference_id,
            amountTotal: session.amount_total
          });

          try {
            const userId = session.client_reference_id;
            const amountPaid = session.amount_total;

            // Determine token amount based on the payment amount
            let tokenAmount = PACKAGE_TOKENS[amountPaid] || 42; // Default to starter package if amount doesn't match

            console.log('Payment amount:', amountPaid);
            console.log('Token amount to be added:', tokenAmount);

            // Update user's token balance
            await dbRun(
              'UPDATE users SET token_balance = token_balance + ? WHERE id = ?',
              [tokenAmount, userId]
            );

            // Log the token purchase
            await dbRun(
              'INSERT INTO tokens_history (user_id, amount, action) VALUES (?, ?, ?)',
              [userId, tokenAmount, 'PURCHASE']
            );

            console.log('Successfully updated token balance for user:', userId);
            console.log('New tokens added:', tokenAmount);

            // Get updated token balance
            const result = await dbRun(
              'SELECT token_balance FROM users WHERE id = ?',
              [userId]
            );
            console.log('Updated token balance:', result);

          } catch (error) {
            console.error('Database operation failed:', error);
            return res.status(500).json({ error: 'Failed to update token balance' });
          }
        }

        res.json({ received: true });
      } catch (error) {
        console.error('Unexpected error in webhook handler:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Test endpoint
    router.get('/test', (req, res) => {
      console.log('Test endpoint hit');
      res.json({ 
        message: 'Stripe webhook endpoint is configured',
        webhookSecretPresent: !!process.env.STRIPE_WEBHOOK_SECRET,
        webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length
      });
    });

    export default router;
