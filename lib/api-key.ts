// A helper function to get the API key from local storage
export function getApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem('gemini-api-key')
} 