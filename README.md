# Luken Lighting - Website & Internal Portal

A production-ready Next.js application for Luken Lighting, featuring a premium public website and secure internal administration portal.

## 🌟 Features

### Public Website
- **Premium Design**: Clean, minimal aesthetic inspired by high-end lighting brands
- **Product Catalogue**: Comprehensive product listings with advanced filtering
- **Collections & Applications**: Organized product discovery
- **SEO Optimized**: Server-side rendering, metadata, and structured data
- **Responsive**: Mobile-first design that works on all devices
- **Professional Resources**: Technical documentation and downloads

### Admin Portal
- **Secure Authentication**: Supabase Auth with protected routes
- **Product Management**: Full CRUD for products, variants, and specifications
- **Asset Management**: Upload and organize images and documents
- **Dashboard**: Overview of catalogue statistics
- **No Public Access**: Admin portal accessible only via direct URL (/admin)

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Deployment**: Vercel-ready

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   cd luken-lighting
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   Create a new project at [supabase.com](https://supabase.com)

4. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Update with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Run database migrations**

   In your Supabase SQL Editor, run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_row_level_security.sql`
   - `supabase/seed.sql` (optional, for sample data)

6. **Create an admin user**

   In Supabase Auth, create a user, then add their profile:
   ```sql
   INSERT INTO user_profiles (id, full_name, role) 
   VALUES ('[user-uuid-from-auth]', 'Admin User', 'admin');
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

   Visit:
   - Public site: `http://localhost:3000`
   - Admin portal: `http://localhost:3000/admin`

## 📁 Project Structure

```
luken-lighting/
├── app/
│   ├── (public)/          # Public website pages
│   │   ├── page.tsx       # Homepage
│   │   ├── products/      # Product listing & detail
│   │   ├── collections/   # Collections pages
│   │   ├── applications/  # Application pages
│   │   ├── about/         # About page
│   │   ├── professionals/ # Professional resources
│   │   └── contact/       # Contact page
│   │
│   └── (admin)/           # Admin portal (protected)
│       └── admin/
│           ├── login/     # Login page
│           ├── dashboard/ # Admin dashboard
│           ├── products/  # Product management
│           ├── categories/
│           ├── collections/
│           ├── documents/
│           └── prices/
│
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── SiteHeader.tsx
│   ├── SiteFooter.tsx
│   ├── ProductCard.tsx
│   ├── AdminHeader.tsx
│   └── AdminSidebar.tsx
│
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── types.ts          # TypeScript types
│   ├── seo.ts            # SEO utilities
│   └── utils.ts          # Helper functions
│
└── supabase/
    ├── migrations/       # Database schema
    └── seed.sql          # Sample data
```

## 🗄️ Database Schema

### Main Tables

- **products**: Product catalogue with full specifications
- **product_categories**: Product categorization
- **collections**: Product families/series
- **applications**: Use cases (residential, commercial, etc.)
- **product_variants**: Color/finish/CCT variants
- **product_assets**: Images, datasheets, photometric files
- **price_lists**: Multiple pricing tiers
- **product_prices**: Prices per product per list
- **user_profiles**: Admin user roles and permissions

### Row Level Security (RLS)

- Public read access for active products
- Admin/Editor write access with role checks
- Secure by default

## 🔒 Security

- **No Public Login**: Admin portal has no visible link from public site
- **Middleware Protection**: Automatic redirect if not authenticated
- **RLS Policies**: Database-level security
- **Server Components**: Sensitive operations on server only

## 🎨 Customization

### Branding

Update branding in:
- `tailwind.config.ts` - Colors and design tokens
- `components/SiteHeader.tsx` - Logo and navigation
- `app/layout.tsx` - Site metadata

### Adding Products

1. Via Admin Portal: `/admin/products/new`
2. Via Database: Direct SQL inserts
3. Via API: Create server actions for bulk imports

### Extending Filters

Add new filters in:
- `lib/types.ts` - Add to ProductFilters interface
- `components/ProductFilters.tsx` - Add UI controls
- `app/(public)/products/page.tsx` - Add query logic

## 📤 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Compatible with any Next.js hosting:
- Netlify
- Railway
- Self-hosted

## 🛠️ Development

### Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
```

### Database Updates

When modifying the schema:
1. Update types in `lib/types.ts`
2. Create migration SQL
3. Update affected components

## 📝 Content Management

### Adding New Products

Products can be managed:
1. **Via Admin Portal** - User-friendly interface at `/admin/products`
2. **Via Supabase Dashboard** - Direct database access
3. **Via SQL** - Bulk operations

### Upload Files

Use Supabase Storage buckets:
- Create a `product-images` bucket
- Create a `documents` bucket
- Update file URLs in product_assets table

### Update Content

Static content (About, etc.) is in page files:
- For CMS-like editing, consider adding a content table
- Or use environment variables for configurable text

## 🤝 Support & Maintenance

### Common Tasks

1. **Add Category**: Insert into `product_categories`
2. **Add Collection**: Insert into `collections`
3. **Bulk Update**: Use SQL or create admin tools
4. **Backup**: Automated via Supabase

### Troubleshooting

- **Can't login**: Check user exists in auth.users and user_profiles
- **Products not showing**: Verify `is_active = true`
- **Images not loading**: Check Supabase Storage permissions
- **Filters not working**: Check search params and query logic

## 📄 License

Proprietary - Luken Lighting

## 🙏 Credits

Built with Next.js, Supabase, and Tailwind CSS.

---

**Need help?** Contact the development team or consult the inline code comments for detailed implementation notes.

