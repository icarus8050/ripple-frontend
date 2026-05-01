import type { Message, Room, RoomKind, User } from '../types/chat'
import { CURRENT_USER_ID, getRoomKind } from '../types/chat'

const me: User = { id: CURRENT_USER_ID, name: '나', avatarColor: '#aa3bff' }

const yujin: User = { id: 'u-yujin', name: '김유진', avatarColor: '#ff7a45' }
const minseok: User = { id: 'u-minseok', name: '박민석', avatarColor: '#36cfc9' }
const sora: User = { id: 'u-sora', name: '이소라', avatarColor: '#9254de' }
const jihoon: User = { id: 'u-jihoon', name: '정지훈', avatarColor: '#52c41a' }
const haeun: User = { id: 'u-haeun', name: '한하은', avatarColor: '#f5222d' }

export const mockRooms: Room[] = [
  {
    id: 'r-1',
    name: '김유진',
    participants: [me, yujin],
    lastMessagePreview: '내일 회의 자료 같이 보실래요?',
    lastMessageAt: '오후 2:14',
    unreadCount: 2,
  },
  {
    id: 'r-2',
    name: '프론트엔드 팀',
    participants: [me, minseok, sora, jihoon],
    lastMessagePreview: '박민석: 배포 끝났습니다 🚀',
    lastMessageAt: '오후 1:02',
    unreadCount: 0,
  },
  {
    id: 'r-3',
    name: '이소라',
    participants: [me, sora],
    lastMessagePreview: '점심 뭐 드셨어요?',
    lastMessageAt: '오전 11:48',
    unreadCount: 0,
  },
  {
    id: 'r-4',
    name: '주간 스터디',
    participants: [me, yujin, minseok, sora, jihoon, haeun],
    lastMessagePreview: '한하은: 다음 주 발표는 제가 할게요',
    lastMessageAt: '어제',
    unreadCount: 5,
  },
]

export const mockRoomsByKind: Record<RoomKind, Room[]> = {
  direct: mockRooms.filter((r) => getRoomKind(r) === 'direct'),
  group: mockRooms.filter((r) => getRoomKind(r) === 'group'),
}

export const mockMessagesByRoom: Record<string, Message[]> = {
  'r-1': [
    {
      id: 'm-1-1',
      roomId: 'r-1',
      senderId: yujin.id,
      content: '안녕하세요! 잠깐 시간 괜찮으세요?',
      createdAt: '오후 2:10',
    },
    {
      id: 'm-1-2',
      roomId: 'r-1',
      senderId: me.id,
      content: '네 괜찮아요. 무슨 일이세요?',
      createdAt: '오후 2:12',
    },
    {
      id: 'm-1-3',
      roomId: 'r-1',
      senderId: yujin.id,
      content: '내일 회의 자료 같이 보실래요?',
      createdAt: '오후 2:14',
    },
    {
      id: 'm-1-4',
      roomId: 'r-1',
      senderId: yujin.id,
      content: '30분 정도면 충분할 것 같아요.',
      createdAt: '오후 2:14',
    },
  ],
  'r-2': [
    {
      id: 'm-2-1',
      roomId: 'r-2',
      senderId: minseok.id,
      content: '오늘 배포 일정 공유드립니다.',
      createdAt: '오후 12:30',
    },
    {
      id: 'm-2-2',
      roomId: 'r-2',
      senderId: sora.id,
      content: 'QA 환경 먼저 확인할게요.',
      createdAt: '오후 12:45',
    },
    {
      id: 'm-2-3',
      roomId: 'r-2',
      senderId: jihoon.id,
      content: '지표 모니터링 켜뒀습니다 👀',
      createdAt: '오후 12:58',
    },
    {
      id: 'm-2-4',
      roomId: 'r-2',
      senderId: minseok.id,
      content: '배포 끝났습니다 🚀',
      createdAt: '오후 1:02',
    },
    {
      id: 'm-2-5',
      roomId: 'r-2',
      senderId: me.id,
      content: '수고하셨습니다!',
      createdAt: '오후 1:05',
    },
  ],
  'r-3': [
    {
      id: 'm-3-1',
      roomId: 'r-3',
      senderId: sora.id,
      content: '점심 뭐 드셨어요?',
      createdAt: '오전 11:48',
    },
    {
      id: 'm-3-2',
      roomId: 'r-3',
      senderId: me.id,
      content: '국밥이요 🍲',
      createdAt: '오전 11:50',
    },
  ],
  'r-4': [
    {
      id: 'm-4-1',
      roomId: 'r-4',
      senderId: yujin.id,
      content: '다음 주 주제 정해야 해요!',
      createdAt: '어제 오후 9:10',
    },
    {
      id: 'm-4-2',
      roomId: 'r-4',
      senderId: jihoon.id,
      content: '저는 React 19의 useOptimistic 정리해보고 싶어요.',
      createdAt: '어제 오후 9:15',
    },
    {
      id: 'm-4-3',
      roomId: 'r-4',
      senderId: haeun.id,
      content: '다음 주 발표는 제가 할게요',
      createdAt: '어제 오후 9:20',
    },
  ],
}
