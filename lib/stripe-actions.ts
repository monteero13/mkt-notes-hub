'use server';

import { createPortalSession as createPortal, createCheckoutSession as createCheckout } from './stripe';

export async function handleCreatePortalSession() {
  return await createPortal();
}

export async function handleCreateCheckoutSession(priceId: string) {
  return await createCheckout(priceId);
}
