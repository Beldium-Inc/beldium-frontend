This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000, http://localhost:3001](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Monexay folder structure
## 📁 Project Folder Structure

monexay-frontend/
├── app/
│   ├── layout.tsx              # Root layout (global styles, providers)
│   ├── page.tsx                # Entry page (can redirect to dashboard)
│   ├── globals.css             # Tailwind global styles
│   │
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard home
│   │   ├── users/
│   │   │   └── page.tsx        # Users page
│   │   └── settings/
│   │       └── page.tsx        # Settings page
│   │
│   └── auth/
│       └── login/
│           └── page.tsx        # Login page
│
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx # Sidebar + Header wrapper
│   │   ├── Sidebar.tsx         # Sidebar menu
│   │   └── Header.tsx          # Top navigation bar
│   │
│   ├── forms/
│   │   └── LoginForm.tsx       # Ant Design form with validation
│   │
│   ├── ui/
│   │   └── PrimaryButton.tsx   # Reusable UI components
│   │
│   └── common/
│       └── LoadingSpinner.tsx  # Shared components
│
├── state/                      # Global state management
│   ├── index.ts                # Export all stores
│   │
│   ├── auth/
│   │   ├── auth.store.ts       # Auth state (user, tokens)
│   │   └── auth.selectors.ts   # Auth selectors
│   │
│   ├── ui/
│   │   ├── ui.store.ts         # UI state (sidebar, theme)
│   │   └── ui.selectors.ts
│   │
│   ├── dashboard/
│   │   └── dashboard.store.ts  # Dashboard-specific global state
│   │
│   └── middleware/
│       └── persist.ts          # Persistence helpers (localStorage)
│
├── lib/
│   ├── api.ts                  # API client (fetch/axios)
│   ├── auth.ts                 # Auth utilities (JWT helpers)
│   └── constants.ts            # App-wide constants
│
├── hooks/
│   └── useAuth.ts              # Custom React hooks
│
├── types/
│   └── index.ts                # Shared TypeScript types
│
├── public/
│   └── images/                 # Static assets
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
├── yarn.lock
└── README.md
