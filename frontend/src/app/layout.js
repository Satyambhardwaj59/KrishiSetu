import StoreProvider from '@/components/providers/StoreProvider';
import SocketInitializer from '@/components/providers/SocketInitializer';
import ToastProvider from '@/components/ui/ToastProvider';
import Navbar from '@/components/ui/Navbar';
import './globals.css';
import Footer from '@/components/ui/Footer';

export const metadata = {
  title: 'KrishiSetu - Connecting Farms to Business',
  description: 'A premium B2B Agricultural Marketplace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 font-sans antialiased">
        <StoreProvider>
          <SocketInitializer>
            <ToastProvider />
            <Navbar />
            {children}
            <Footer/>
          </SocketInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
