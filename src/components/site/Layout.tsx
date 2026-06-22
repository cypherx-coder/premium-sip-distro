import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { WhatsappFloat } from "./Whatsapp";
import { BackToTop } from "./BackToTop";

export function SiteLayout({ children, transparentNav = false }: { children: ReactNode; transparentNav?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <main className={transparentNav ? "" : "pt-24"}>{children}</main>
      <Footer />
      <WhatsappFloat />
      <BackToTop />
    </div>
  );
}
