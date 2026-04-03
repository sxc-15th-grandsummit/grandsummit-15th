import Header from '@/components/header'
import Footer from '@/components/footer'
import PageBackground from '@/components/page-background'
import { NAV_ITEMS, ASSETS } from '@/constants'

export default function ComingSoonPage() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden text-white"
      style={{ background: 'linear-gradient(180deg, #011f33 30%, #03263e 62%, #063250 100%)' }}
    >
      <PageBackground />

      <div className="relative z-10 flex flex-1 flex-col">
        <Header navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo }} />

        <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <p className="mb-4 font-plus-jakarta text-xs font-bold uppercase tracking-[0.25em] text-accent-teal/70">
            Stay tuned
          </p>
          <h1
            className="mb-5 font-plus-jakarta text-5xl font-bold text-white sm:text-6xl lg:text-7xl"
            style={{ textShadow: '0 2px 24px rgba(87,174,165,0.35)' }}
          >
            Coming Soon
          </h1>
          <p className="max-w-sm font-poppins text-base text-white/50">
            We&apos;re working on something exciting. Check back soon for updates!
          </p>
        </main>

        <Footer navItems={NAV_ITEMS} assets={{ summitLogo: ASSETS.heroLogo, sxcLogo: ASSETS.sxcLogo, instagram: ASSETS.instagram }} />
      </div>
    </div>
  )
}
