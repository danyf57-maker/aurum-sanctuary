# Epic 6: Payments & Subscription

**Epic ID:** EPIC-06  
**Priority:** P0 (Critical - Monetization)  
**Estimated Stories:** 4  
**Status:** Not Started  
**Dependencies:** EPIC-01 (Infrastructure), EPIC-02 (Authentication), EPIC-05 (Insight Engine)

---

## Epic Goal

Implement Stripe integration for subscription management, including payment flows, webhook handling, subscription gates, and paywall UI. This epic enables monetization and ensures free users see value before conversion.

---

## User Value

As a **user (Alma)**, I need to subscribe to access full insights so that I can continue gaining clarity on my emotional patterns.

---

## Success Criteria

- [x] Users can subscribe via Stripe Checkout
- [x] Subscription status synced to Firestore
- [x] Paywall enforced for full insight access
- [x] Webhooks handle subscription events (created, updated, canceled)
- [x] Free users see insight teaser (value-first conversion)
- [x] Subscription status displayed in UI

---

## Stories

### Story 6.1: Setup Stripe Integration

**Story ID:** STORY-6.1  
**Priority:** P0  
**Dependencies:** STORY-1.2 (Firebase Configuration)

**As a** developer  
**I want** to integrate Stripe SDK and configure products  
**So that** users can subscribe to paid plans

**Acceptance Criteria:**
- [ ] Stripe account created (test + production modes)
- [ ] Stripe SDK installed (`stripe`, `@stripe/stripe-js`)
- [ ] `lib/stripe/server.ts` created with Stripe server SDK
- [ ] `lib/stripe/client.ts` created with Stripe client SDK
- [ ] Stripe API keys stored in environment variables
- [ ] Product created in Stripe Dashboard: "Aurum Sanctuary Pro"
- [ ] Price created: $9.99/month (or user-defined pricing)
- [ ] Webhook endpoint configured in Stripe Dashboard

**Environment Variables:**
```bash
# Server-side (Cloud Functions, API Routes)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Architecture Reference:** `architecture.md` Section "FR15-FR16: Payments"

---

### Story 6.2: Implement Stripe Checkout Flow

**Story ID:** STORY-6.2  
**Priority:** P0  
**Dependencies:** STORY-6.1

**As a** user  
**I want** to subscribe via Stripe Checkout  
**So that** I can access full insights

**Acceptance Criteria:**
- [ ] `app/api/stripe/create-checkout-session/route.ts` created
- [ ] API route creates Stripe Checkout Session
- [ ] Session includes: user email, success URL, cancel URL
- [ ] Client redirects to Stripe Checkout
- [ ] Success URL: `/dashboard?session_id={CHECKOUT_SESSION_ID}`
- [ ] Cancel URL: `/insights` (return to paywall)
- [ ] Session metadata includes: `userId`, `firebaseUid`
- [ ] Error handling: Stripe API errors, network errors

**Implementation:**
```typescript
// app/api/stripe/create-checkout-session/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { userId, email } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: [{
      price: process.env.STRIPE_PRICE_ID!, // From Stripe Dashboard
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/insights`,
    metadata: { userId, firebaseUid: userId },
  });
  
  return Response.json({ sessionId: session.id });
}
```

**Architecture Reference:** `architecture.md` Section "Stripe Integration"

---

### Story 6.3: Implement Stripe Webhook Handler

**Story ID:** STORY-6.3  
**Priority:** P0  
**Dependencies:** STORY-6.2

**As a** developer  
**I want** to handle Stripe webhook events  
**So that** subscription status is synced to Firestore

**Acceptance Criteria:**
- [ ] `app/api/stripe/webhook/route.ts` created
- [ ] Webhook signature verified (Stripe webhook secret)
- [ ] Events handled:
  - `customer.subscription.created` → Update Firestore `subscriptionStatus: 'active'`
  - `customer.subscription.updated` → Update Firestore subscription data
  - `customer.subscription.deleted` → Update Firestore `subscriptionStatus: 'canceled'`
  - `invoice.payment_succeeded` → Log payment event
  - `invoice.payment_failed` → Update Firestore `subscriptionStatus: 'past_due'`
- [ ] Firestore schema: `users/{uid}.subscriptionStatus`, `users/{uid}.stripeCustomerId`
- [ ] Idempotent handling (prevent duplicate updates)
- [ ] Error handling: invalid signature, missing metadata

**Implementation:**
```typescript
// app/api/stripe/webhook/route.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await firestore.doc(`users/${subscription.metadata.firebaseUid}`).update({
        subscriptionStatus: subscription.status,
        stripeCustomerId: subscription.customer,
        subscriptionId: subscription.id,
      });
      break;
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription;
      await firestore.doc(`users/${deletedSub.metadata.firebaseUid}`).update({
        subscriptionStatus: 'canceled',
      });
      break;
  }
  
  return Response.json({ received: true });
}
```

**Architecture Reference:** `architecture.md` Section "Stripe Webhooks"

---

### Story 6.4: Implement Paywall UI & Subscription Gates

**Story ID:** STORY-6.4  
**Priority:** P0  
**Dependencies:** STORY-6.2, STORY-5.4 (Insight Display)

**As a** user  
**I want** to see a paywall after viewing my insight teaser  
**So that** I understand the value before subscribing

**Acceptance Criteria:**
- [ ] Free users see insight teaser (first 100 characters)
- [ ] Paywall modal appears after teaser
- [ ] Paywall message: "Subscribe to see your full insight and continue your clarity journey"
- [ ] "Subscribe Now" button redirects to Stripe Checkout
- [ ] "Maybe Later" button closes modal (non-intrusive)
- [ ] Paid users see full insight (no paywall)
- [ ] Subscription status checked client-side (Firestore `users/{uid}.subscriptionStatus`)
- [ ] Subscription badge shown in UI ("Pro" badge)

**Paywall Copy (Non-Anxious):**
```
Your weekly insight is ready.

Subscribe to:
✓ See your full insight
✓ Access all past insights
✓ Continue building your emotional clarity map

No pressure. Your writing is always safe and private.

[Subscribe Now] [Maybe Later]
```

**Architecture Reference:** `architecture.md` Section "Free → Paid Conversion Logic"

---

## Dependencies

**Blocks:**
- Epic 8 (Analytics) - Subscription events tracked

**Blocked By:**
- EPIC-01 (Infrastructure) - Environment variables, API Routes
- EPIC-02 (Authentication) - User identity
- EPIC-05 (Insight Engine) - Insight content to gate

---

## Technical Notes

- **Stripe Test Mode**: Use test keys for development, production keys for prod
- **Webhook Signature**: Always verify signature to prevent spoofing
- **Idempotency**: Use Stripe event ID to prevent duplicate processing
- **Subscription Status**: Enum: `active`, `past_due`, `canceled`, `trialing`
- **Pricing**: Configurable via Stripe Dashboard (no hardcoded prices)

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Webhook delivery failures | Implement retry logic, monitor Stripe Dashboard |
| Subscription status drift | Periodic sync job (daily check Stripe API) |
| Payment fraud | Use Stripe Radar (built-in fraud detection) |
| User confusion (paywall) | Clear, non-anxious copy, value-first approach |

---

## Definition of Done

- [ ] All 4 stories completed and acceptance criteria met
- [ ] Users can subscribe via Stripe Checkout
- [ ] Webhooks sync subscription status to Firestore
- [ ] Paywall enforced for free users
- [ ] Paid users access full insights
- [ ] Unit tests for webhook handler (>80% coverage)
- [ ] Integration tests for checkout flow
- [ ] E2E tests for subscription journey
- [ ] Code reviewed and merged to main
- [ ] Epic marked as "Complete" in project tracking
