import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_secret_key';
const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as any
});

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planType } = req.body;
    
    // Dynamic origin fallback (Vercel domain or localhost)
    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'https://career-connect-client-theta.vercel.app';

    const amount = planType === 'employer_featured' ? 1000 : 500; // $10 or $5 USD
    const itemName = planType === 'employer_featured' 
      ? 'CareerConnect Premium Featured Campus Job' 
      : 'CareerConnect Verified Student Pro Badge';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
              description: 'Campus hiring priority badge on CareerConnect Pinboard',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${clientUrl}/dashboard?payment=success`,
      cancel_url: `${clientUrl}/dashboard?payment=cancel`,
    });

    res.json({ url: session.url, id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create Stripe payment checkout session' });
  }
};
