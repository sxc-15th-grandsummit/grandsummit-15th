import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function getRegistrationStatus() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['bcc_registration_open', 'mcc_registration_open'])

  const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))
  return {
    bccOpen: map['bcc_registration_open'] === 'true',
    mccOpen: map['mcc_registration_open'] === 'true',
  }
}

export default async function CompetitionPage() {
  const { bccOpen, mccOpen } = await getRegistrationStatus()

  const competitions = [
    {
      slug: 'bcc',
      label: 'BCC',
      fullName: 'Business Case Competition',
      description: 'Analyze and solve real-world business challenges with your team. Compete against the brightest minds from universities across Indonesia.',
      open: bccOpen,
      guidebookUrl: process.env.BCC_GUIDEBOOK_URL ?? '#',
      color: 'from-teal-700 to-teal-900',
    },
    {
      slug: 'mcc',
      label: 'MCC',
      fullName: 'Marketing Case Competition',
      description: 'Craft innovative marketing strategies for industry-leading brands. Showcase your creativity and analytical thinking on a national stage.',
      open: mccOpen,
      guidebookUrl: process.env.MCC_GUIDEBOOK_URL ?? '#',
      color: 'from-blue-800 to-teal-900',
    },
  ]

  return (
    <main className="min-h-screen bg-[#00243c] px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center font-plus-jakarta text-4xl font-bold text-white">Competitions</h1>
        <p className="mb-12 text-center text-teal-300">Choose your competition and register your team.</p>

        <div className="grid gap-6 md:grid-cols-2">
          {competitions.map(comp => (
            <div
              key={comp.slug}
              className={`rounded-2xl bg-gradient-to-br ${comp.color} border border-teal-500/20 p-8`}
            >
              <div className="mb-1 font-plus-jakarta text-xs font-bold uppercase tracking-widest text-teal-300">
                {comp.label}
              </div>
              <h2 className="mb-3 font-plus-jakarta text-2xl font-bold text-white">{comp.fullName}</h2>
              <p className="mb-6 text-sm leading-relaxed text-white/70">{comp.description}</p>

              <div className="flex flex-col gap-3">
                <a
                  href={comp.guidebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-teal-400/40 py-2.5 text-center text-sm font-semibold text-teal-200 transition hover:bg-teal-500/20"
                >
                  Download Guidebook
                </a>

                {comp.open ? (
                  <Link
                    href={`/competition/${comp.slug}/register`}
                    className="rounded-xl bg-teal-500 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-teal-400"
                  >
                    Register
                  </Link>
                ) : (
                  <button
                    disabled
                    className="rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white/40 cursor-not-allowed"
                  >
                    Registration Closed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
