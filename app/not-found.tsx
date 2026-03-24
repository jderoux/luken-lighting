import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Container className="text-center">
        <h1 className="text-6xl font-light tracking-widest uppercase mb-4">404</h1>
        <h2 className="text-2xl font-light tracking-wide uppercase mb-6 text-gray-600">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">Go Home</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

