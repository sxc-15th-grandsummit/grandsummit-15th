import type { Metadata } from "next";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { NAV_ITEMS, ASSETS } from "@/constants";
import EventsContent from "./events-content";

export const metadata: Metadata = {
  title: "The Summit 15th",
  description:
    "The Summit 15th — Leading with Strategy, Powered by AI, Grounded in Ethics. Speakers, sessions, and exclusive seats for StudentsxCEOs Grand Summit 15th.",
};

export default function EventsPage() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-clip text-white"
      style={{
        backgroundColor: "var(--background)",
        backgroundImage:
          "linear-gradient(180deg, rgba(0,36,60,0.82) 0%, rgba(8,58,83,0.78) 40%, rgba(6,50,80,0.9) 100%), url('/background.webp')",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <Header
        navItems={NAV_ITEMS}
        assets={{
          summitLogo: ASSETS.heroLogo,
          sxcLogo: ASSETS.sxcLogo,
        }}
      />

      <main className="relative z-10 flex flex-1 flex-col">
        <EventsContent />
      </main>

      <div className="relative z-20">
        <Footer
          navItems={NAV_ITEMS}
          assets={{
            summitLogo: ASSETS.heroLogo,
            sxcLogo: ASSETS.sxcLogo,
            instagram: ASSETS.instagram,
          }}
        />
      </div>
    </div>
  );
}
