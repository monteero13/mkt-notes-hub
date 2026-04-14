import Stripe from 'stripe'
import { createServerFn } from '@tanstack/react-start'

// Instantiate Stripe only if the secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24-preview' as any,
    })
  : null

/**
 * Server function to create a Stripe Checkout Session.
 */
export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator((priceId: string) => priceId)
  .handler(async ({ data: priceId }) => {
    if (!stripe) {
      throw new Error('Stripe is not configured on the server')
    }

    // In a real app, you'd get the user from Supabase here
    // const user = await getUser() 
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/?success=true`,
        cancel_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/pricing?canceled=true`,
        // customer_email: user.email,
        subscription_data: {
          metadata: {
            // userId: user.id
          }
        }
      })

      return { sessionId: session.id, url: session.url }
    } catch (error: any) {
      console.error('Stripe Error:', error)
      throw new Error(error.message)
    }
  })

/**
 * Simple helper to check if the user is Pro (Mocked for now).
 * In production, this would query your Supabase 'profiles' table.
 */
export async function isUserPro(userId: string): Promise<boolean> {
  // Mock logic: 
  // return await supabase.from('profiles').select('is_pro').eq('id', userId).single()
  return false 
}
