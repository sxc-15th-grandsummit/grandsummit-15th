'use client'

import { useState } from 'react'

type SubEvent = {
  title: string
  body: string
}

export default function SubEventsCarousel({
  events,
  cardBg,
}: {
  events: ReadonlyArray<SubEvent>
  cardBg: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)

  function showPrev() {
    setActiveIndex((current) => (current === 0 ? events.length - 1 : current - 1))
  }

  function showNext() {
    setActiveIndex((current) => (current === events.length - 1 ? 0 : current + 1))
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="relative overflow-hidden rounded-[1.5rem]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {events.map((event) => (
            <article key={event.title} className="w-full shrink-0">
              <div
                className="flex min-h-[260px] flex-col justify-between rounded-[1.5rem] border border-white/10 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:min-h-[300px] sm:p-10"
                style={{ background: cardBg }}
              >
                <div>
                  <p className="mb-3 font-plus-jakarta text-xs font-bold uppercase tracking-[0.22em] text-accent-teal/80">
                    Sub Event
                  </p>
                  <h3 className="font-plus-jakarta text-2xl font-bold text-white sm:text-3xl">
                    {event.title}
                  </h3>
                  <p className="mt-5 max-w-3xl font-poppins text-sm leading-relaxed text-white/75 sm:text-base">
                    {event.body}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <span className="font-plus-jakarta text-sm font-medium text-white/45">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={showPrev}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-plus-jakarta text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      className="rounded-full border border-accent-teal/40 bg-accent-teal/10 px-4 py-2 font-plus-jakarta text-sm font-semibold text-accent-teal transition hover:bg-accent-teal/20"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        {events.map((event, index) => (
          <button
            key={event.title}
            type="button"
            aria-label={`Go to ${event.title}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              index === activeIndex ? 'w-10 bg-accent-teal' : 'w-2.5 bg-white/25 hover:bg-white/45'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
