import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import CartSidebar from '@/components/CartSidebar';
import PullToRefresh from '@/components/PullToRefresh';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Aivori',
  description: 'Vibrant e-commerce platform for Malaysian snacks',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="bg-[var(--color-theme-beige)] text-[var(--color-theme-brown)] font-sans min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <PullToRefresh>
            <main className="flex-grow">
              {children}
            </main>
          </PullToRefresh>
          <CartSidebar />
        </AuthProvider>
      </body>
    </html>
  );
}
