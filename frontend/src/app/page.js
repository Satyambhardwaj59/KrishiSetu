import React from 'react';
import dynamic from 'next/dynamic';
import { BASE_URL } from '@/constants/endPoints';

// Metadata for SEO -
export const metadata = {
  title: 'KrishiSetu: Direct Farm to Business Marketplace | Sell Crops Online India',
  description: 'India\'s leading agricultural platform connecting farmers directly with institutional buyers. Eliminate middlemen, get fair prices, secure escrow payments, and AI-driven agri-advisory. Join 100,000+ farmers today.',
  keywords: 'agriculture marketplace, sell crops online, buy grains wholesale, agritech platform, farm to business, direct farmer selling, KrishiSetu, agricultural supply chain, farm procurement',
  authors: [{ name: 'KrishiSetu' }],
  openGraph: {
    title: 'KrishiSetu: Connect Farms to Business | Direct Agri-Trade Platform',
    description: 'Transform your agricultural trade. Farmers get better prices (20-30% higher), buyers get quality graded produce. Join 100k+ farmers and 5k+ buyers.',
    url: BASE_URL,
    siteName: 'KrishiSetu',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'KrishiSetu platform connecting Indian farmers with business buyers',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KrishiSetu: Direct Farm-to-Business Marketplace',
    description: 'Sell harvest directly to institutional buyers. Fair prices, instant payments, no middlemen.',
    images: [`${BASE_URL}/twitter-image.jpg`], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console code
  },
};

const LandingPage = dynamic(() => import('@/components/helper/LandingPage'), {
  ssr: true,
});

export default function Page() {
  return <LandingPage />;
}