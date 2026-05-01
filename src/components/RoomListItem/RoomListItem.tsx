import { UserAvatar } from '../UserAvatar/UserAvatar'
import type { Room } from '../../types/chat'
import { CURRENT_USER_ID, getRoomKind } from '../../types/chat'
import './RoomListItem.css'

type RoomListItemProps = {
  room: Room
  selected: boolean
  onSelect: (roomId: string) => void
}

export function RoomListItem({ room, selected, onSelect }: RoomListItemProps) {
  const direct = getRoomKind(room) === 'direct'
  const otherParticipants = room.participants.filter((p) => p.id !== CURRENT_USER_ID)
  const displayUser = direct ? otherParticipants[0] : null

  return (
    <button
      type="button"
      className={`room-list-item${selected ? ' room-list-item--selected' : ''}`}
      onClick={() => onSelect(room.id)}
    >
      {displayUser ? (
        <UserAvatar name={displayUser.name} color={displayUser.avatarColor} size="md" />
      ) : (
        <span className="room-list-item__group-icon" aria-hidden="true">
          #
        </span>
      )}
      <span className="room-list-item__body">
        <span className="room-list-item__top">
          <span className="room-list-item__name">{room.name}</span>
          <span className="room-list-item__time">{room.lastMessageAt}</span>
        </span>
        <span className="room-list-item__bottom">
          <span className="room-list-item__preview">{room.lastMessagePreview}</span>
          {room.unreadCount > 0 && (
            <span className="room-list-item__badge" aria-label={`읽지 않은 메시지 ${room.unreadCount}개`}>
              {room.unreadCount}
            </span>
          )}
        </span>
        {!direct && (
          <span className="room-list-item__meta">참여자 {room.participants.length}명</span>
        )}
      </span>
    </button>
  )
}
