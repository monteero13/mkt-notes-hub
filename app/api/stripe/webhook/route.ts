import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(request: Request) {
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
      // Find the user by stripe_customer_id and set is_pro to false
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single()
      
      if (profile) {
        await supabase
          .from('profiles')
          .update({ is_pro: false })
          .eq('id', profile.id)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

export const dynamic = 'force-dynamic'
