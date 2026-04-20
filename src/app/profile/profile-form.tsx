'use client'

import { useState, useTransition } from 'react'
import { saveProfile, logout } from './actions'
import type { ProfileData } from './actions'

const inputClass =
  'w-full rounded-[10px] bg-white/10 px-3 py-2 text-xs font-poppins text-white placeholder-[rgba(184,222,218,0.8)] outline-none focus:bg-white/15 focus:ring-1 focus:ring-accent-teal/50 transition'

const labelClass =
  'block text-xs font-bold font-plus-jakarta text-white mb-1'

type Field = { name: keyof ProfileData; label: string; placeholder: string; type?: string }

const LEFT_FIELDS: Field[] = [
  { name: 'full_name',  label: 'Full Name',               placeholder: 'Your Full Name' },
  { name: 'birth_date', label: 'Birth Date',               placeholder: 'DD/MM/YYYY' },
  { name: 'domicile',   label: 'Domicile',                 placeholder: 'Your Domicile' },
  { name: 'whatsapp',   label: 'WhatsApp Phone Number',    placeholder: '08XXXXXXXXXX' },
  { name: 'line_id',    label: 'Line ID',                  placeholder: 'your_line_id' },
]

const RIGHT_FIELDS: Field[] = [
  { name: 'current_education', label: 'Current Education',  placeholder: 'Your Current Education' },
  { name: 'university',        label: 'University/School',  placeholder: 'Your University/School' },
]

export default function ProfileForm({ initial }: { initial: Partial<ProfileData> | null }) {
  const [values, setValues] = useState<Partial<ProfileData>>(initial ?? {})
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => saveProfile(fd))
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {LEFT_FIELDS.map(f => (
            <div key={f.name}>
              <label className={labelClass}>{f.label}</label>
              <input
                name={f.name}
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={(values[f.name] as string) ?? ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {RIGHT_FIELDS.map(f => (
            <div key={f.name}>
              <label className={labelClass}>{f.label}</label>
              <input
                name={f.name}
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={(values[f.name] as string) ?? ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          ))}

          {/* Student Identity Card upload */}
          <div>
            <label className={labelClass}>Student Identity Card</label>
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-[10px] bg-white/10 px-4 py-2 text-xs font-poppins text-[rgba(184,222,218,0.8)] transition hover:bg-white/15">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload Here
                <input type="file" className="hidden" accept="image/*,.pdf" />
              </label>
              {values.student_card_url && (
                <span className="text-xs text-accent-teal">Uploaded</span>
              )}
              <input type="hidden" name="student_card_url" value={values.student_card_url ?? ''} />
            </div>
          </div>

          {/* Email (read-only, from auth) */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              type="email"
              placeholder={initial?.['student_card_url'] ? '' : 'your@email.com'}
              readOnly
              value=""
              className={inputClass + ' opacity-60 cursor-not-allowed'}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full px-6 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110 disabled:opacity-60"
            style={{ background: 'rgba(87,174,165,0.3)' }}
          >
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setValues(initial ?? {})}
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium font-plus-jakarta text-white transition hover:bg-white/15"
          >
            Cancel
          </button>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold font-plus-jakarta text-white transition hover:brightness-110"
            style={{ background: 'rgba(87,174,165,0.3)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log Out
          </button>
        </form>
      </div>
    </form>
  )
}
