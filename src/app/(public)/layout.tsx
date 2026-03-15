import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PublicLayoutWrapper from "@/components/public/PublicLayoutWrapper";
import { Cormorant, Playfair_Display, Montserrat, Poppins } from "next/font/google";

const cormorant = Cormorant({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: '--font-cormorant' });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: '--font-playfair' });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: '--font-montserrat' });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: '--font-poppins' });

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fonts = `${cormorant.variable} ${playfair.variable} ${montserrat.variable} ${poppins.variable}`;

  return (
    <PublicLayoutWrapper 
      header={<Header />}
      footer={<Footer />}
      fonts={fonts}
    >
      {children}
    </PublicLayoutWrapper>
  );
}
