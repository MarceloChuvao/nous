import { Button } from '@/components/ui/button'

interface QuickQuestionsProps {
  questions: string[]
  onSelect: (question: string) => void
}

export function QuickQuestions({ questions, onSelect }: QuickQuestionsProps) {
  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-600 mb-3">Quick Questions:</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            onClick={() => onSelect(question)}
            className="text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
