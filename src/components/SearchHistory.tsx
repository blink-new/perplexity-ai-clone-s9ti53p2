import { Clock, Search } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { ScrollArea } from './ui/scroll-area'
import { SearchHistory as SearchHistoryType } from '../types/search'

interface SearchHistoryProps {
  history: SearchHistoryType[]
  onHistoryClick: (query: string) => void
}

export function SearchHistory({ history, onHistoryClick }: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No search history yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your searches will appear here</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Searches
      </h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {history.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start h-auto p-3 text-left"
              onClick={() => onHistoryClick(item.query)}
            >
              <Search className="w-4 h-4 shrink-0 mr-3 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-2">{item.query}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}