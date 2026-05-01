import { useState } from 'react'
import { ChatInput } from '../../components/ChatInput/ChatInput'
import { MessageList } from '../../components/MessageList/MessageList'
import { RoomHeader } from '../../components/RoomHeader/RoomHeader'
import { RoomList } from '../../components/RoomList/RoomList'
import { mockMessagesByRoom, mockRoomsByKind } from '../../lib/mock-data'
import type { Message, RoomKind } from '../../types/chat'
import { CURRENT_USER_ID } from '../../types/chat'
import './ChatLayout.css'

const counts: Record<RoomKind, number> = {
  direct: mockRoomsByKind.direct.length,
  group: mockRoomsByKind.group.length,
}

function pickFirstRoomId(kind: RoomKind): string {
  return mockRoomsByKind[kind][0]?.id ?? ''
}

export function ChatLayout() {
  const [activeTab, setActiveTab] = useState<RoomKind>('direct')
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => pickFirstRoomId('direct'))
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>(mockMessagesByRoom)

  const visibleRooms = mockRoomsByKind[activeTab]
  const selectedRoom = visibleRooms.find((r) => r.id === selectedRoomId) ?? null
  const messages = selectedRoom ? messagesByRoom[selectedRoom.id] ?? [] : []

  const handleTabChange = (tab: RoomKind) => {
    setActiveTab(tab)
    const stillVisible = mockRoomsByKind[tab].some((r) => r.id === selectedRoomId)
    if (!stillVisible) {
      setSelectedRoomId(pickFirstRoomId(tab))
    }
  }

  const handleSend = (text: string) => {
    if (!selectedRoom) return
    const newMessage: Message = {
      id: crypto.randomUUID(),
      roomId: selectedRoom.id,
      senderId: CURRENT_USER_ID,
      content: text,
      createdAt: new Date().toLocaleTimeString('ko-KR', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }
    setMessagesByRoom((prev) => ({
      ...prev,
      [selectedRoom.id]: [...(prev[selectedRoom.id] ?? []), newMessage],
    }))
  }

  return (
    <div className="chat-layout">
      <RoomList
        rooms={visibleRooms}
        selectedRoomId={selectedRoom?.id ?? null}
        onSelect={setSelectedRoomId}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={counts}
      />
      <main className="chat-layout__main">
        {selectedRoom ? (
          <>
            <RoomHeader room={selectedRoom} />
            <MessageList messages={messages} participants={selectedRoom.participants} />
            <ChatInput
              placeholder={`${selectedRoom.name}에게 메시지 보내기`}
              onSend={handleSend}
            />
          </>
        ) : (
          <div className="chat-layout__empty">
            {activeTab === 'direct'
              ? '시작할 개인 채팅을 선택해 주세요.'
              : '시작할 그룹 채팅을 선택해 주세요.'}
          </div>
        )}
      </main>
    </div>
  )
}
