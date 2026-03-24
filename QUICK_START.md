# Quick Start Guide

Get your Luken Lighting website running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account

## Steps

### 1. Install Dependencies (1 min)

```bash
npm install
```

### 2. Set Up Supabase (2 min)

1. Create project at [supabase.com](https://supabase.com)
2. Run SQL migrations in Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_row_level_security.sql`
   - `supabase/seed.sql` (optional sample data)

### 3. Configure Environment (30 sec)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Get these from: Supabase → Settings → API

### 4. Create Admin User (1 min)

In Supabase → Authentication → Users:
- Add user with email/password

Then in SQL Editor:
```sql
INSERT INTO user_profiles (id, full_name, role) 
VALUES ('[paste-user-id-here]', 'Admin', 'admin');
```

### 5. Start Development (30 sec)

```bash
npm run dev
```

Visit:
- **Public site**: http://localhost:3000
- **Admin portal**: http://localhost:3000/admin

## Next Steps

1. **Add Products**: Login to admin → Products → Add Product
2. **Upload Images**: Use Supabase Storage or `/public/images/`
3. **Customize**: Update colors in `tailwind.config.ts`
4. **Deploy**: Push to GitHub → Deploy on Vercel

## Need Help?

- **Full Setup**: See `SETUP_GUIDE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Documentation**: See `README.md`

## Common Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Run production build
npm run lint         # Check code
npm run type-check   # TypeScript validation
```

## File Structure (Key Files)

```
app/
├── (public)/        # Public website
│   ├── page.tsx     # Homepage
│   ├── products/    # Product pages
│   └── ...
└── (admin)/         # Admin portal
    └── admin/
        ├── login/   # Login page
        └── ...      # Admin pages

components/          # UI components
lib/
├── supabase/       # Database clients
├── types.ts        # TypeScript types
└── utils.ts        # Helper functions

supabase/
├── migrations/     # Database schema
└── seed.sql        # Sample data
```

## Quick Customization

### Change Colors
Edit `tailwind.config.ts`:
```ts
colors: {
  brand: {
    copper: '#YourColor',
  }
}
```

### Change Logo
Edit `components/SiteHeader.tsx`:
```tsx
// Replace text with your logo
<Image src="/logo.svg" ... />
```

### Update Content
- About page: `app/(public)/about/page.tsx`
- Contact: `app/(public)/contact/page.tsx`
- Homepage: `app/(public)/page.tsx`

---

**Ready to launch!** 🚀

For detailed information, check the other documentation files.

