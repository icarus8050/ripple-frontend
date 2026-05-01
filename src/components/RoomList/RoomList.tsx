import { RoomListItem } from '../RoomListItem/RoomListItem'
import type { Room, RoomKind } from '../../types/chat'
import './RoomList.css'

type RoomListProps = {
  rooms: Room[]
  selectedRoomId: string | null
  onSelect: (roomId: string) => void
  activeTab: RoomKind
  onTabChange: (tab: RoomKind) => void
  counts: Record<RoomKind, number>
}

const TABS: { kind: RoomKind; label: string }[] = [
  { kind: 'direct', label: '개인' },
  { kind: 'group', label: '그룹' },
]

export function RoomList({
  rooms,
  selectedRoomId,
  onSelect,
  activeTab,
  onTabChange,
  counts,
}: RoomListProps) {
  return (
    <aside className="room-list" aria-label="채팅방 목록">
      <header className="room-list__header">
        <h2 className="room-list__title">채팅</h2>
        <div className="room-list__tabs" role="tablist" aria-label="채팅 종류">
          {TABS.map((tab) => {
            const selected = tab.kind === activeTab
            return (
              <button
                key={tab.kind}
                type="button"
                role="tab"
                aria-selected={selected}
                className={`room-list__tab${selected ? ' room-list__tab--active' : ''}`}
                onClick={() => onTabChange(tab.kind)}
              >
                {tab.label}
                <span className="room-list__tab-count">{counts[tab.kind]}</span>
              </button>
            )
          })}
        </div>
      </header>
      {rooms.length === 0 ? (
        <p className="room-list__empty">
          {activeTab === 'direct' ? '개인 채팅이 없어요.' : '그룹 채팅이 없어요.'}
        </p>
      ) : (
        <ul className="room-list__items">
          {rooms.map((room) => (
            <li key={room.id}>
              <RoomListItem
                room={room}
                selected={room.id === selectedRoomId}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
