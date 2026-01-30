# Aurum Sanctuary

A privacy-first mental health journaling app with AI-powered insights.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **AI**: DeepSeek (LLM for Mirror Chat & Insights)
- **Payments**: Stripe
- **Analytics**: PostHog
- **Hosting**: Vercel (Next.js), Firebase (Cloud Functions)

## Key Features

- **Encrypted Journaling**: Client-side AES-256-GCM encryption
- **Mirror Chat**: AI-powered reflective questioning (Vercel Edge Runtime)
- **Weekly Insights**: Automated emotional pattern analysis
- **Privacy-First**: Admin-Blind processing, no PII in logs
- **Subscription Model**: Free tier + Pro ($9.99/month)

## Project Structure

```
aurum-sanctuary/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public routes (login, signup, terms)
│   │   ├── (protected)/       # Protected routes (dashboard, journal, insights)
│   │   └── api/               # API routes (Edge & Node runtimes)
│   ├── components/
│   │   ├── ui/                # Base UI components (shadcn/ui)
│   │   └── features/          # Feature-specific components
│   ├── lib/
│   │   ├── firebase/          # Firebase client & admin SDK
│   │   ├── crypto/            # Client-side encryption
│   │   ├── deepseek/          # DeepSeek adapter
│   │   ├── stripe/            # Stripe integration
│   │   ├── logger/            # Safe logging utilities
│   │   └── schemas/           # Zod validation schemas
│   └── store/                 # Zustand stores
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       ├── updateDerivedMemory.ts
│       ├── generateInsight.ts
│       ├── getContentKey.ts
│       └── deleteUserAccount.ts
├── _bmad-output/
│   ├── epics/                 # Epic & story definitions
│   └── planning-artifacts/    # Architecture, PRD, UX docs
└── docs/                      # Additional documentation

```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Firebase CLI
- Vercel CLI (optional)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

**For detailed setup instructions, see [docs/development-setup.md](docs/development-setup.md)**

### Environment Variables

See `.env.example` for required variables:

- Firebase config (client & admin)
- DeepSeek API key
- Stripe keys
- Upstash Redis credentials
- PostHog API key

## Development

```bash
# Run dev server (Turbopack)
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build
```

## Architecture Decisions

See `_bmad-output/planning-artifacts/architecture.md` for detailed architecture documentation.

### Key Decisions

- **wrappedContentKey**: Random AES-256 key wrapped by Google Cloud KMS
- **Edge Runtime**: Mirror Chat uses Vercel Edge for <400ms latency
- **Admin-Blind**: Automated processes can decrypt, humans cannot
- **Rate Limiting**: Upstash Redis (20 req/min Mirror Chat, 60 req/h getContentKey)
- **Hard Delete**: GDPR compliance, no soft delete

## Privacy & Security

- Client-side encryption (AES-256-GCM)
- No PII in logs or analytics
- Firestore Rules enforce access control
- Safe logging patterns (`logger.errorSafe`)
- CI checks for prohibited privacy terms

## License

Proprietary - All rights reserved

## Contact

For questions or support, contact: [contact@aurumsanctuary.com]
