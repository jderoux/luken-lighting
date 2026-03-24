import { Metadata } from 'next';
import { getSiteImage } from '@/lib/site-images';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lukenlighting.com';
const siteName = 'Luken Lighting';
const siteDescription = 'Architectural lighting designed to disappear. Clean, minimal fixtures that let the space shine.';
const defaultOgFallback = `${siteUrl}/images/og-default.jpg`;

export function generateMetadata({
  title,
  description,
  image,
  path = '',
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}): Metadata {
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const pageDescription = description || siteDescription;
  const pageUrl = `${siteUrl}${path}`;
  const pageImage = image || defaultOgFallback;

  return {
    title: pageTitle,
    description: pageDescription,
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export async function generateMetadataWithCMS(opts: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}): Promise<Metadata> {
  if (!opts.image) {
    const ogImage = await getSiteImage('og_default');
    if (ogImage?.image_url) {
      return generateMetadata({ ...opts, image: ogImage.image_url });
    }
  }
  return generateMetadata(opts);
}

// Generate JSON-LD schema for products (returns the schema object)
export function generateProductSchema(product: {
  name: string;
  description: string;
  code: string;
  image?: string;
  brand?: string;
  price?: number;
  currency?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.code,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Luken Lighting',
    },
    ...(product.image && {
      image: product.image,
    }),
    ...(product.price && {
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'USD',
        availability: 'https://schema.org/InStock',
      },
    }),
  };
}

