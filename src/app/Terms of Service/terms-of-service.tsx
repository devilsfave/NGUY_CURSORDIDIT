import React from 'react';
import Link from 'next/link';

const TermsOfService: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-[#171B26] text-[#EFEFED]">
      <h1 className="text-3xl font-bold mb-6">DermaVision Terms of Service</h1>
      <p className="mb-4">Last updated: June 14, 2023</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>By accessing or using the DermaVision service, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
        <p>DermaVision provides an AI-powered dermatological analysis service. Our service is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
        <p>You must create an account to use certain features of our service. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. User Content</h2>
        <p>You retain all rights to any content you submit, post or display on or through the service. By submitting, posting or displaying content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate and distribute it.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Privacy</h2>
        <p>Your privacy is important to us. It is DermaVision's policy to respect your privacy regarding any information we may collect from you across our website. Our Privacy Policy explains how we collect, use, and share information about you when you use our services.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
        <p>In no event shall DermaVision, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
        <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">8. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at:</p>
        <p>Email: herbertyeboah123@gmail.com</p>
        <p>Address: DA-72 SDA ST</p>
      </section>

      <p className="mt-8">By using our service, you acknowledge that you have read and understood these Terms of Service.</p>

      <Link href="/" className="text-blue-500 hover:underline mt-8 inline-block">
        Back to Home
      </Link>
    </div>
  );
};

export default TermsOfService;