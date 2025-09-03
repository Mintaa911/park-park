'use client'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {

  return (
    <div className="flex flex-col flex-1 mt-8">
      <main className="flex-1 overflow-auto w-full max-w-7xl mx-auto px-5">
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          scriptProps={{ async: true, defer: true }}>
          {children}
        </GoogleReCaptchaProvider>
      </main>
    </div>
  );
}