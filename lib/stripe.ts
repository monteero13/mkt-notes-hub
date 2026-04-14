'use server';

import Stripe from 'stripe';
import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';

// Instantiate Stripe only if the secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24-preview' as any,
  })
  : null;

/**
 * Server action to create a Stripe Checkout Session.
 */
export async function createCheckoutSession(priceId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured on the server');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const host = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${host}/?success=true`,
      cancel_url: `${host}/pricing?canceled=true`,
      customer_email: user.email,
      subscription_data: {
        metadata: {
          userId: user.id
        }
      }
    });

    if (session.url) {
      redirect(session.url);
    }
    
    return { sessionId: session.id };
  } catch (error: any) {
    console.error('Stripe Error:', error);
    throw new Error(error.message);
  }
}

/**
 * Helper to check if the user is Pro.
 */
export async function isUserPro(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('is_pro').eq('id', userId).single();
  if (error || !data) return false;
  return !!data.is_pro;
}
