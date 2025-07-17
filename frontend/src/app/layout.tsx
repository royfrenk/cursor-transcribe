import './globals.css';
import { Inter } from 'next/font/google';
import Providers from './Providers';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Podcast Transcription Service',
    description: 'Transcribe your podcasts with AI-powered accuracy',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" dir="ltr">
            <body className={inter.className}>
                <Providers>
                  <div className="min-h-screen flex flex-col">
                      <Navigation />
                      <main className="flex-grow">
                          {children}
                      </main>
                      <Footer />
                  </div>
                </Providers>
            </body>
        </html>
    );
} 