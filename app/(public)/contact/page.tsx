'use client';

import { useState, FormEvent } from 'react';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission
    // In production, you would send this to your backend or email service
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', company: '', phone: '', message: '' });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="py-12 lg:py-16">
      <Container size="lg">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl lg:text-5xl font-light tracking-widest uppercase mb-6">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team for technical support, project consultation, or to find an authorized distributor near you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-light tracking-wide uppercase mb-8">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
              />

              <Input
                label="Company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company (optional)"
              />

              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000 (optional)"
              />

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project or inquiry..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 text-gray-900 transition-colors"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                  There was an error sending your message. Please try again.
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-light tracking-wide uppercase mb-8">
              Contact Information
            </h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
                  General Inquiries
                </h3>
                <p className="text-gray-600">
                  <a href="mailto:info@lukenlighting.com" className="hover:text-gray-900">
                    info@lukenlighting.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
                  Technical Support
                </h3>
                <p className="text-gray-600">
                  <a href="mailto:technical@lukenlighting.com" className="hover:text-gray-900">
                    technical@lukenlighting.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
                  Distributors & Specification
                </h3>
                <p className="text-gray-600">
                  <a href="mailto:sales@lukenlighting.com" className="hover:text-gray-900">
                    sales@lukenlighting.com
                  </a>
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
                  Office Hours
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 2:00 PM<br />
                  Sunday: Closed
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
                  Find a Dealer
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our products are available exclusively through authorized distributors. Contact us to find a dealer near you.
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">
                  Professional Resources
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Access technical datasheets, photometric files, and catalogues.
                </p>
                <a
                  href="/professionals"
                  className="inline-flex items-center text-sm font-medium uppercase tracking-wide text-gray-900 hover:text-brand-copper transition-colors"
                >
                  Visit Resources →
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

