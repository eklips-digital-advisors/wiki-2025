'use client'

import { useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  type LoginErrorResponse = { errors?: { message?: string }[] }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Trim and validate email and password
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Both fields are required.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError(null)

    const res = await fetch(`${getClientSideURL()}/api/users/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
    })

    if (res.ok) {
      window.location.href = '/'
    } else {
      const json = (await res.json()) as LoginErrorResponse
      setError(json?.errors?.[0]?.message || 'Login failed')
    }
  }

  return (
    <div className="mb-10">
      <div className="sm:w-full sm:max-w-sm">
        <h2 className="text-2xl/9 font-semibold tracking-tight text-zinc-900">
          Sign in required
        </h2>
      </div>

      <div className="mt-8 sm:w-full sm:max-w-sm">
        <form action="#" method="POST" className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-zinc-900">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-emerald-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-zinc-900">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-zinc-900 outline -outline-offset-1 outline-zinc-300 placeholder:text-zinc-400 focus:outline focus:-outline-offset-2 focus:outline-emerald-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-zinc-800 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-zinc-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-600 cursor-pointer"
            >
              Sign in
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-rose-600" role="alert">{error}</p>}
        </form>
      </div>
    </div>
  )
}
