import { useState } from 'react'
import { Copy, Share2, ExternalLink, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { SearchResult } from '../types/search'

interface SearchResponseProps {
  result: SearchResult
  onFollowUpClick: (question: string) => void
}

export function SearchResponse({ result, onFollowUpClick }: SearchResponseProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: result.query,
        text: result.response,
        url: window.location.href
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Response */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{result.query}</h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-muted-foreground hover:text-foreground"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none text-foreground">
          {result.isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Generating response...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed">
              {result.response}
            </div>
          )}
        </div>
      </Card>

      {/* Sources */}
      {result.sources.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Sources</h3>
          <div className="grid gap-3">
            {result.sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
              >
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  {index + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-blue-600 transition-colors line-clamp-1">
                      {source.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{source.domain}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{source.snippet}</p>
                </div>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Follow-up Questions */}
      {result.followUpQuestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-medium text-foreground mb-4">Follow-up Questions</h3>
          <div className="grid gap-2">
            {result.followUpQuestions.map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start h-auto p-3 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                onClick={() => onFollowUpClick(question)}
              >
                <ChevronRight className="w-4 h-4 shrink-0 mr-2" />
                <span className="flex-1">{question}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}