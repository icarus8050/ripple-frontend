export type User = {
  id: string
  name: string
  avatarColor: string
}

export type Message = {
  id: string
  roomId: string
  senderId: string
  content: string
  createdAt: string
}

export type Room = {
  id: string
  name: string
  participants: User[]
  lastMessagePreview: string
  lastMessageAt: string
  unreadCount: number
}

export const CURRENT_USER_ID = 'u-me'

export type RoomKind = 'direct' | 'group'

export function getRoomKind(room: Room): RoomKind {
  return room.participants.length === 2 ? 'direct' : 'group'
}
