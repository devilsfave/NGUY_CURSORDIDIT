import React from 'react';
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="lazyOnload"
          onLoad={() => {
            (window as any).fbAsyncInit = function() {
              (window as any).FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
                cookie: true,
                xfbml: true,
                version: 'v11.0'
              });
            };
          }}
        />
      </body>
    </html>
  );
}