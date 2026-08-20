import { useState, useRef } from 'react'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const getApiUrl = (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${API_BASE}${url}`
}

export function useStream() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const abortRef = useRef(null)

  const stream = async (url, body) => {
    if (abortRef.current) abortRef.current.abort()

    abortRef.current = new AbortController()

    setText('')
    setError('')
    setLoading(true)

    try {
      const res = await fetch(getApiUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        full += chunk
        setText(full)
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setText('')
    setError('')
  }

  return {
    text,
    loading,
    error,
    stream,
    reset,
  }
}

export function useJson() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetch_ = async (url, body) => {
    setData(null)
    setError('')
    setLoading(true)

    try {
      const res = await fetch(getApiUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    fetch: fetch_,
  }
}