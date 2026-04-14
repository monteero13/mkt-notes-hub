import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/lib/supabase.server'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

/**
 * Handle Stripe Webhooks.
 * This should be connected to /api/stripe/webhook in your Stripe dashboard.
 */
export const stripeWebhookHandler = createServerFn({ method: 'POST' })
  .handler(async () => {
    const request = getRequest()
    if (!request) return new Response('No request context', { status: 500 })
    if (!stripe) return new Response('Stripe not configured', { status: 500 })

    const signature = request.headers.get('stripe-signature')
    if (!signature) return new Response('No signature', { status: 400 })

    let event: Stripe.Event
    const rawBody = await request.text()

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId) {
          // Update user to Pro in Supabase
          await supabase
            .from('profiles')
            .update({ is_pro: true, stripe_customer_id: session.customer })
            .eq('id', userId)
        }
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        // Handle subscription deletion
        // You would find the user by stripe_customer_id and set is_pro to false
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
