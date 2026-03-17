/**
 * pages/_app.jsx — MiniFanzo
 * Exact design match to original HTML/CSS/JS site
 */

import "@/styles/globals.css";
import Head from "next/head";
import { CartProvider }     from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Header               from "@/components/layout/Header";
import Footer               from "@/components/layout/Footer";
import WhatsAppFloat        from "@/components/ui/WhatsAppFloat";

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <Head>
          {/* Google Fonts — exact same as original */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          {/* Font Awesome — exact same as original */}
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>

        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Component {...pageProps} />
          </main>
          <Footer />
          <WhatsAppFloat />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
