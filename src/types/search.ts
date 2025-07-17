export interface SearchResult {
  id: string
  query: string
  response: string
  sources: Source[]
  followUpQuestions: string[]
  timestamp: number
  isStreaming?: boolean
}

export interface Source {
  title: string
  url: string
  snippet: string
  domain: string
}

export interface SearchHistory {
  id: string
  query: string
  userId: string
  timestamp: number
}