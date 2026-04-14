import Stripe from 'stripe'
import { createServerFn } from '@tanstack/react-start'
import { createSupabaseServerClient, getUserSession } from './supabase.server'

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
  .inputValidator((priceId: string) => priceId)
  .handler(async ({ data: priceId }) => {
    if (!stripe) {
      throw new Error('Stripe is not configured on the server')
    }

    // Get the user from Supabase
    const user = await getUserSession()
    if (!user) {
      throw new Error('Authentication required')
    }

    const host = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

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
        customer_email: user.user.email,
        subscription_data: {
          metadata: {
            userId: user.user.id
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
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase.from('profiles').select('is_pro').eq('id', userId).single()
  if (error || !data) return false
  return !!data.is_pro
}
