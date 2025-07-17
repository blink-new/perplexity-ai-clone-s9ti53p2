import { useState, useEffect, useCallback } from 'react'
import { ThemeProvider } from 'next-themes'
import { Header } from './components/Header'
import { SearchInput } from './components/SearchInput'
import { SearchResponse } from './components/SearchResponse'
import { SearchHistory } from './components/SearchHistory'
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet'
import { blink } from './blink/client'
import { SearchResult, SearchHistory as SearchHistoryType } from './types/search'

function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentResult, setCurrentResult] = useState<SearchResult | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryType[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadSearchHistory = useCallback(async () => {
    if (!user) return
    
    try {
      // Try to load from localStorage first as fallback
      const localHistory = localStorage.getItem(`search_history_${user.id}`)
      if (localHistory) {
        const parsed = JSON.parse(localHistory)
        setSearchHistory(parsed.slice(0, 20))
      }
    } catch (error) {
      console.error('Failed to load search history:', error)
    }
  }, [user])

  // Load search history when user is available
  useEffect(() => {
    if (user) {
      loadSearchHistory()
    }
  }, [user, loadSearchHistory])

  const saveToHistory = async (query: string) => {
    if (!user) return
    
    try {
      const historyItem: SearchHistoryType = {
        id: `search_${Date.now()}`,
        query,
        userId: user.id,
        timestamp: Date.now()
      }
      
      // Save to localStorage as fallback
      const currentHistory = searchHistory
      const newHistory = [historyItem, ...currentHistory.slice(0, 19)]
      localStorage.setItem(`search_history_${user.id}`, JSON.stringify(newHistory))
      setSearchHistory(newHistory)
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!user || isSearching) return

    setIsSearching(true)
    setSidebarOpen(false)
    
    // Create initial result with streaming state
    const searchId = `search_${Date.now()}`
    const initialResult: SearchResult = {
      id: searchId,
      query,
      response: '',
      sources: [],
      followUpQuestions: [],
      timestamp: Date.now(),
      isStreaming: true
    }
    
    setCurrentResult(initialResult)
    await saveToHistory(query)

    try {
      let fullResponse = ''
      
      // Stream the AI response with web search
      await blink.ai.streamText(
        {
          prompt: `You are Perplexity AI, an expert research assistant. Answer this question comprehensively using current information: "${query}"
          
          Provide a detailed, well-structured response that:
          1. Directly answers the question
          2. Includes relevant context and background
          3. Uses current, accurate information
          4. Is clear and easy to understand
          
          Format your response in a conversational but informative tone.`,
          search: true,
          maxTokens: 1000
        },
        (chunk) => {
          fullResponse += chunk
          setCurrentResult(prev => prev ? {
            ...prev,
            response: fullResponse,
            isStreaming: true
          } : null)
        }
      )

      // Generate mock sources and follow-up questions
      const mockSources = [
        {
          title: "Comprehensive Guide to " + query.slice(0, 50),
          url: "https://example.com/source1",
          snippet: "Detailed information about " + query + " with expert insights and analysis.",
          domain: "example.com"
        },
        {
          title: "Latest Research on " + query.slice(0, 40),
          url: "https://research.example.com/article",
          snippet: "Recent findings and developments related to " + query + ".",
          domain: "research.example.com"
        }
      ]

      const mockFollowUps = [
        `What are the latest developments in ${query}?`,
        `How does ${query} compare to alternatives?`,
        `What are the practical applications of ${query}?`
      ]

      // Update with final result
      setCurrentResult(prev => prev ? {
        ...prev,
        response: fullResponse,
        sources: mockSources,
        followUpQuestions: mockFollowUps,
        isStreaming: false
      } : null)

    } catch (error) {
      console.error('Search failed:', error)
      setCurrentResult(prev => prev ? {
        ...prev,
        response: 'Sorry, I encountered an error while searching. Please try again.',
        isStreaming: false
      } : null)
    } finally {
      setIsSearching(false)
    }
  }

  const handleFollowUpClick = (question: string) => {
    handleSearch(question)
  }

  const handleHistoryClick = (query: string) => {
    handleSearch(query)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Perplexity AI</h1>
          <p className="text-muted-foreground mb-6">Please sign in to start searching and get AI-powered answers.</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <SearchHistory 
              history={searchHistory}
              onHistoryClick={handleHistoryClick}
            />
          </aside>

          {/* Mobile Sidebar */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80">
              <SearchHistory 
                history={searchHistory}
                onHistoryClick={handleHistoryClick}
              />
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <main className="space-y-6">
            {!currentResult ? (
              <div className="max-w-2xl mx-auto text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <span className="text-white font-bold text-3xl">P</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  What can I help you discover?
                </h1>
                <p className="text-muted-foreground mb-8 text-lg">
                  Ask me anything and I'll search the web to give you comprehensive, up-to-date answers.
                </p>
                <div className="max-w-xl mx-auto">
                  <SearchInput 
                    onSearch={handleSearch}
                    isLoading={isSearching}
                    placeholder="Ask anything..."
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                <SearchInput 
                  onSearch={handleSearch}
                  isLoading={isSearching}
                  placeholder="Ask a follow-up question..."
                />
                <SearchResponse 
                  result={currentResult}
                  onFollowUpClick={handleFollowUpClick}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppContent />
    </ThemeProvider>
  )
}

export default App