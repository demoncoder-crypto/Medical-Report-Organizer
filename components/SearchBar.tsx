'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getApiKey } from '@/lib/api-key'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setResults([])
    try {
      const apiKey = getApiKey()
      const headers = new Headers({ 'Content-Type': 'application/json' })
      if (apiKey) {
        headers.append('X-Gemini-Api-Key', apiKey)
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      })

      const searchData = await response.json()
      if (!response.ok) {
        throw new Error(searchData.error || 'Search failed')
      }

      setResults(searchData.results)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ask about your medical history... (e.g., 'What were my cholesterol levels last year?')"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSearching}
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">Try:</span>
        {[
          'blood pressure history',
          'recent prescriptions',
          'lab results 2024',
          'allergies mentioned',
          'doctor recommendations'
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setQuery(suggestion)}
            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium text-gray-700">Search Results:</h3>
          {results.map((result, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{result.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                From: {result.documentName} • {result.date}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 