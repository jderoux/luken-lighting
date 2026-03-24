# Luken Lighting - Setup Guide

This guide will walk you through setting up the Luken Lighting website from scratch.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `luken-lighting`
   - Database password: (secure password)
   - Region: (choose closest to your users)

## Step 3: Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy:
   - Project URL
   - anon/public key

## Step 4: Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Run Database Migrations

In Supabase SQL Editor, execute these files in order:

### 5.1. Initial Schema
Run `supabase/migrations/001_initial_schema.sql`

This creates:
- All tables (products, categories, collections, etc.)
- Indexes for performance
- Triggers for updated_at timestamps

### 5.2. Row Level Security
Run `supabase/migrations/002_row_level_security.sql`

This sets up:
- Public read access for active content
- Protected write access for admins
- User profile policies

### 5.3. Seed Data (Optional)
Run `supabase/seed.sql`

This adds:
- Sample categories
- Sample applications
- Sample collections
- 6 sample products
- Default price list

## Step 6: Create Storage Buckets

In Supabase Storage:

1. Create bucket: `product-images`
   - Public: Yes
   - File size limit: 10MB
   - Allowed MIME types: image/*

2. Create bucket: `documents`
   - Public: Yes
   - File size limit: 50MB
   - Allowed MIME types: application/pdf, application/ies, etc.

## Step 7: Create Admin User

### 7.1. Create Auth User

In Supabase **Authentication** → **Users**:
1. Click "Add User"
2. Fill in:
   - Email: your-admin@email.com
   - Password: (secure password)
   - Auto Confirm: Yes

### 7.2. Add User Profile

In Supabase SQL Editor:

```sql
-- Replace [user-id] with the UUID from auth.users
INSERT INTO user_profiles (id, full_name, role) 
VALUES ('[user-id]', 'Admin User', 'admin');
```

To get the user ID:
```sql
SELECT id, email FROM auth.users;
```

## Step 8: Test the Application

### 8.1. Start Development Server

```bash
npm run dev
```

### 8.2. Test Public Site

Visit http://localhost:3000

You should see:
- Homepage with hero
- Categories section
- Applications section
- Featured products (if seed data loaded)

### 8.3. Test Admin Login

1. Visit http://localhost:3000/admin
2. Should redirect to http://localhost:3000/admin/login
3. Login with your admin credentials
4. Should redirect to dashboard

### 8.4. Test Product Management

In admin portal:
1. Click "Products" in sidebar
2. Click "Add Product"
3. Fill in basic information
4. Click "Create Product"

## Step 9: Add Product Images

### Option 1: Upload to Supabase Storage

1. Go to Supabase Storage → `product-images`
2. Upload images
3. Get public URL
4. Add to database:

```sql
INSERT INTO product_assets (product_id, type, title, file_url, file_extension, sort_order)
VALUES (
  '[product-id]',
  'image',
  'Main Product Image',
  'https://your-project.supabase.co/storage/v1/object/public/product-images/image.jpg',
  'jpg',
  1
);
```

### Option 2: Use Local Images

1. Place images in `public/images/products/`
2. Reference as `/images/products/filename.jpg`

## Step 10: Configure for Production

### 10.1. Update Environment Variables

For production, set:
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 10.2. Update Metadata

In `lib/seo.ts`, update:
- Site name
- Default description
- Default image

### 10.3. Add Logo

Replace text logo in `components/SiteHeader.tsx`:

```tsx
// Replace:
<Link href="/" className="text-xl...">
  Luken Lighting
</Link>

// With:
<Link href="/">
  <Image src="/logo.svg" alt="Luken Lighting" width={200} height={40} />
</Link>
```

### 10.4. Customize Colors

In `tailwind.config.ts`, update brand colors:

```ts
colors: {
  brand: {
    copper: '#B87333',        // Your brand color
    'copper-light': '#D4A574',
    'copper-dark': '#8B5A2B',
  },
}
```

## Step 11: Deploy to Vercel

### 11.1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 11.2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
5. Click "Deploy"

## Step 12: Post-Deployment

### 12.1. Configure Custom Domain

In Vercel:
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### 12.2. Update Supabase URLs

In Supabase **Authentication** → **URL Configuration**:
- Add your production domain to allowed redirects

### 12.3. Set up SSL

Vercel automatically provides SSL certificates.

## Common Issues & Solutions

### Issue: Can't login to admin

**Solution**: 
- Verify user exists in auth.users
- Verify user_profiles record exists
- Check that role is 'admin' or 'editor'

### Issue: Products not showing

**Solution**:
- Check `is_active = true` in products table
- Verify category_id is valid
- Check RLS policies are applied

### Issue: Images not loading

**Solution**:
- Verify Storage bucket is public
- Check file URLs are correct
- Ensure CORS is configured in Supabase

### Issue: Filters not working

**Solution**:
- Check searchParams in products page
- Verify filter query logic
- Check category/application slugs match

## Next Steps

1. **Add Real Content**
   - Replace seed data with actual products
   - Upload professional product images
   - Add technical datasheets

2. **Customize Design**
   - Update colors and fonts
   - Add your logo
   - Adjust spacing and layouts

3. **Extend Functionality**
   - Complete product edit page
   - Add bulk import tools
   - Implement document upload UI
   - Add price management

4. **SEO & Marketing**
   - Add Google Analytics
   - Submit sitemap to search engines
   - Set up email notifications

5. **Monitor & Maintain**
   - Set up error tracking (e.g., Sentry)
   - Monitor Supabase usage
   - Regular database backups
   - Update dependencies periodically

## Support

For questions or issues:
- Check inline code comments
- Review README.md
- Consult Next.js documentation
- Consult Supabase documentation

---

**Congratulations!** Your Luken Lighting website is now set up and ready to use.

