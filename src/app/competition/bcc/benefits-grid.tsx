'use client'

import { useState } from 'react'

type Benefit = {
  label: string
  description: string
}

function BenefitCard({
  benefit,
  isActive,
  onActivate,
  onLeave,
}: {
  benefit: Benefit
  isActive: boolean
  onActivate: () => void
  onLeave: () => void
}) {
  return (
    <div
      onMouseEnter={onActivate}
      onMouseLeave={onLeave}
      className={[
        'w-full cursor-default overflow-hidden rounded-[2.8rem] border border-white/10 text-center',
        'bg-[linear-gradient(135deg,rgba(8,32,52,0.45)_0%,rgba(14,48,68,0.4)_100%)]',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm',
        'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isActive
          ? 'border-white/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.18)]'
          : 'hover:border-white/16',
      ].join(' ')}
    >
      {/* collapsed: fixed height via padding; expanded: auto height */}
      <div
        className={[
          'flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          isActive ? 'px-10 py-8' : 'px-10 py-7',
        ].join(' ')}
      >
        <p className="font-plus-jakarta text-[1.05rem] font-medium leading-snug text-white/90 md:text-[1.1rem]">
          {benefit.label}
        </p>

        <div
          className={[
            'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isActive ? 'mt-4 max-h-40 opacity-100' : 'mt-0 max-h-0 opacity-0',
          ].join(' ')}
        >
          <p className="font-poppins text-[0.9rem] leading-[1.6] text-white/65">
            {benefit.description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BenefitsGrid({
  items,
}: {
  items: ReadonlyArray<Benefit>
}) {
  const left = items.slice(0, 4)
  const right = items.slice(4)

  const [activeLeft, setActiveLeft] = useState<number | null>(null)
  const [activeRight, setActiveRight] = useState<number | null>(null)

  return (
    <>
      {/* Mobile: simple pill wrap */}
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3 md:hidden">
        {items.map((b) => (
          <div
            key={b.label}
            className="rounded-full border border-accent-teal/30 bg-[rgba(18,63,87,0.72)] px-5 py-2 font-plus-jakarta text-sm font-medium text-white/85"
          >
            {b.label}
          </div>
        ))}
      </div>

      {/* Desktop: two staggered columns */}
      <div className="mx-auto hidden max-w-5xl gap-x-10 md:grid md:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {left.map((b, i) => (
            <BenefitCard
              key={b.label}
              benefit={b}
              isActive={activeLeft === i}
              onActivate={() => setActiveLeft(i)}
              onLeave={() => setActiveLeft(null)}
            />
          ))}
        </div>

        {/* Right column — offset down to match Figma stagger */}
        <div className="flex flex-col gap-5 pt-22">
          {right.map((b, i) => (
            <BenefitCard
              key={b.label}
              benefit={b}
              isActive={activeRight === i}
              onActivate={() => setActiveRight(i)}
              onLeave={() => setActiveRight(null)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
