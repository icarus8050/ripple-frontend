import { useState, type FormEvent, type KeyboardEvent } from 'react'
import './ChatInput.css'

type ChatInputProps = {
  placeholder: string
  onSend: (text: string) => void
}

export function ChatInput({ placeholder, onSend }: ChatInputProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <textarea
        className="chat-input__field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        aria-label="메시지 입력"
      />
      <button
        type="submit"
        className="chat-input__send"
        disabled={value.trim().length === 0}
        aria-label="전송"
      >
        전송
      </button>
    </form>
  )
}
