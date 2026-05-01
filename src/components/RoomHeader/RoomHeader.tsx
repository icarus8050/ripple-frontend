import { UserAvatar } from '../UserAvatar/UserAvatar'
import type { Room } from '../../types/chat'
import { CURRENT_USER_ID, getRoomKind } from '../../types/chat'
import './RoomHeader.css'

type RoomHeaderProps = {
  room: Room
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const direct = getRoomKind(room) === 'direct'
  const others = room.participants.filter((p) => p.id !== CURRENT_USER_ID)
  const subtitle = direct
    ? '1:1 대화'
    : `${room.participants.length}명 · ${others.map((u) => u.name).join(', ')}`

  return (
    <header className="room-header">
      {direct && others[0] ? (
        <UserAvatar name={others[0].name} color={others[0].avatarColor} size="md" />
      ) : (
        <span className="room-header__group-icon" aria-hidden="true">#</span>
      )}
      <div className="room-header__text">
        <h1 className="room-header__title">{room.name}</h1>
        <p className="room-header__subtitle">{subtitle}</p>
      </div>
    </header>
  )
}
