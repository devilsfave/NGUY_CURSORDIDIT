import React from 'react';
import Link from 'next/link';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 bg-[#171B26] text-[#EFEFED]">
      <h1 className="text-3xl font-bold mb-6">DermaVision Privacy Policy</h1>
      <p className="mb-4">Last updated: October 19, 2024</p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
        <p>Welcome to DermaVision. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website or use our services and tell you about your privacy rights and how the law protects you.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Data We Collect</h2>
        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Identity Data: includes first name, last name, username or similar identifier.</li>
          <li>Contact Data: includes email address and telephone numbers.</li>
          <li>Technical Data: includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
          <li>Profile Data: includes your username and password, your interests, preferences, feedback and survey responses.</li>
          <li>Usage Data: includes information about how you use our website and services.</li>
          <li>Health Data: includes information about your skin condition and medical history related to dermatological issues.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Data</h2>
        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
        <ul className="list-disc list-inside ml-4">
          <li>To register you as a new customer.</li>
          <li>To provide and manage our services to you.</li>
          <li>To manage our relationship with you.</li>
          <li>To improve our website, products/services, marketing or customer relationships.</li>
          <li>To recommend products or services which may be of interest to you.</li>
          <li>To comply with a legal or regulatory obligation.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Data Sharing</h2>
        <p>We may share your personal data with the parties set out below for the purposes set out in this privacy policy:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Healthcare professionals involved in your care.</li>
          <li>Service providers acting as processors who provide IT and system administration services.</li>
          <li>Professional advisers including lawyers, bankers, auditors and insurers.</li>
          <li>Regulators and other authorities who require reporting of processing activities in certain circumstances.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
        <p>We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">7. Your Legal Rights</h2>
        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Request access to your personal data.</li>
          <li>Request correction of your personal data.</li>
          <li>Request erasure of your personal data.</li>
          <li>Object to processing of your personal data.</li>
          <li>Request restriction of processing your personal data.</li>
          <li>Request transfer of your personal data.</li>
          <li>Right to withdraw consent.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">8. Changes to This Privacy Policy</h2>
        <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
        <p>Email: herbertyeboah123@gmail.com</p>
        <p>Address: DA-72 SDA ST</p>
      </section>

      <p className="mt-8">By using our service, you acknowledge that you have read and understood this privacy policy.</p>

      <Link href="/" className="text-blue-500 hover:underline mt-8 inline-block">
        Back to Home
      </Link>
    </div>
  );
};

export default PrivacyPolicy;