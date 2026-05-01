import { Message } from '../Message/Message'
import type { Message as MessageType, User } from '../../types/chat'
import { CURRENT_USER_ID } from '../../types/chat'
import './MessageList.css'

type MessageListProps = {
  messages: MessageType[]
  participants: User[]
}

export function MessageList({ messages, participants }: MessageListProps) {
  const userById = new Map(participants.map((u) => [u.id, u]))

  return (
    <div
      className="message-list"
      role="log"
      aria-live="polite"
      aria-label="메시지"
    >
      {messages.length === 0 ? (
        <p className="message-list__empty">아직 메시지가 없어요. 먼저 인사를 건네보세요.</p>
      ) : (
        messages.map((message, index) => {
          const sender = userById.get(message.senderId)
          if (!sender) return null
          const isOwn = message.senderId === CURRENT_USER_ID
          const prev = messages[index - 1]
          const showSender = !prev || prev.senderId !== message.senderId
          return (
            <Message
              key={message.id}
              message={message}
              sender={sender}
              isOwn={isOwn}
              showSender={showSender}
            />
          )
        })
      )}
    </div>
  )
}
