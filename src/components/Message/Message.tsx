import { UserAvatar } from '../UserAvatar/UserAvatar'
import type { Message as MessageType, User } from '../../types/chat'
import './Message.css'

type MessageProps = {
  message: MessageType
  sender: User
  isOwn: boolean
  showSender: boolean
}

export function Message({ message, sender, isOwn, showSender }: MessageProps) {
  return (
    <div className={`message${isOwn ? ' message--own' : ''}`}>
      {!isOwn && (
        <div className="message__avatar">
          {showSender ? (
            <UserAvatar name={sender.name} color={sender.avatarColor} size="sm" />
          ) : (
            <span className="message__avatar-spacer" aria-hidden="true" />
          )}
        </div>
      )}
      <div className="message__body">
        {!isOwn && showSender && (
          <span className="message__sender">{sender.name}</span>
        )}
        <div className="message__row">
          <div className="message__bubble">{message.content}</div>
          <span className="message__time">{message.createdAt}</span>
        </div>
      </div>
    </div>
  )
}
