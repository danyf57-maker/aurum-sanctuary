# Stripe Webhook Testing Guide

## Local Testing with Stripe CLI

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe

```bash
stripe login
```

This will open your browser to authorize the CLI.

### 3. Forward Webhooks to Localhost

```bash
stripe listen --forward-to localhost:9002/api/stripe/webhook
```

**Output**:
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

### 4. Copy Webhook Secret to .env.local

Copy the `whsec_xxxxx` value and add it to `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 5. Test Webhook Events

In a new terminal, trigger test events:

```bash
# Test subscription created
stripe trigger customer.subscription.created

# Test subscription updated
stripe trigger customer.subscription.updated

# Test subscription deleted
stripe trigger customer.subscription.deleted

# Test payment succeeded
stripe trigger invoice.payment_succeeded

# Test payment failed
stripe trigger invoice.payment_failed
```

### 6. Monitor Webhook Events

Watch the terminal running `stripe listen` to see events being forwarded.

Check your application logs to verify Firestore updates.

---

## Production Webhook Setup

### 1. Deploy Application

Deploy your application to production (Firebase Hosting, Vercel, etc.)

### 2. Configure Webhook Endpoint in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Click "Add endpoint"

### 3. Copy Webhook Signing Secret

Copy the webhook signing secret from the Stripe Dashboard and add it to your production environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Troubleshooting

### Webhook Signature Verification Failed

- Check that `STRIPE_WEBHOOK_SECRET` is correctly set
- Ensure you're using the correct secret (local vs production)
- Verify the webhook endpoint URL is correct

### Events Not Being Received

- Check Stripe Dashboard > Webhooks > Logs
- Verify your application is running and accessible
- Check firewall/network settings

### Firestore Not Updating

- Check application logs for errors
- Verify Firebase Admin SDK is initialized
- Check Firestore security rules allow admin writes

---

## Testing Checklist

- [ ] Stripe CLI installed and logged in
- [ ] Webhook forwarding running (`stripe listen`)
- [ ] `STRIPE_WEBHOOK_SECRET` added to `.env.local`
- [ ] Application running (`npm run dev`)
- [ ] Test events triggered successfully
- [ ] Firestore updates verified
- [ ] Error handling tested (invalid signature, missing metadata)
