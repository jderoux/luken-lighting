import Link from 'next/link';
import { Container } from './ui/Container';

const footerLinks = {
  products: {
    title: 'Products',
    links: [
      { name: 'Downlights', href: '/products?category=downlights' },
      { name: 'Wall Lights', href: '/products?category=wall-lights' },
      { name: 'Pendant Lights', href: '/products?category=pendant-lights' },
      { name: 'Outdoor Lights', href: '/products?category=outdoor-lights' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About Luken', href: '/about' },
      { name: 'Inspiration', href: '/inspiration' },
      { name: 'Contact', href: '/contact' },
      { name: 'Find a Dealer', href: '/contact' },
    ],
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Professionals', href: '/professionals' },
      { name: 'Downloads', href: '/professionals' },
      { name: 'Technical Support', href: '/contact' },
    ],
  },
};

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-24">
      <Container>
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="text-xl font-semibold tracking-widest uppercase mb-4">
                Luken Lighting
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Architectural lighting designed to integrate invisibly into your space. Available through our authorized distributor network.
              </p>
            </div>

            {/* Links */}
            {Object.values(footerLinks).map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {currentYear} Luken Lighting. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

