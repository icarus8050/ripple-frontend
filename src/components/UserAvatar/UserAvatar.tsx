import './UserAvatar.css'

type UserAvatarProps = {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export function UserAvatar({ name, color, size = 'md' }: UserAvatarProps) {
  const initial = name.trim().charAt(0) || '?'
  return (
    <span
      className={`user-avatar user-avatar--${size}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
