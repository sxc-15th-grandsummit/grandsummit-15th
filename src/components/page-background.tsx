/**
 * Shared decorative background for Profile and Registration pages.
 * Uses assets from public/regist-profile/.
 */
export default function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* Top large ellipse glow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/regist-profile/top-elipse.png"
        alt=""
        className="absolute left-1/2 top-0 w-[110vw] max-w-none"
        style={{ transform: 'translateX(-50%) translateY(-40%)', opacity: 0.9 }}
      />
      {/* Left ellipse */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/regist-profile/left-elipse.png"
        alt=""
        className="absolute left-0 w-[38vw] max-w-[500px]"
        style={{ top: '30vh', transform: 'translateX(-30%)', opacity: 0.75 }}
      />
      {/* Right ellipse */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/regist-profile/right-elipse.png"
        alt=""
        className="absolute right-0 w-[32vw] max-w-[420px]"
        style={{ top: '15vh', transform: 'translateX(25%)', opacity: 0.75 }}
      />
    </div>
  )
}
