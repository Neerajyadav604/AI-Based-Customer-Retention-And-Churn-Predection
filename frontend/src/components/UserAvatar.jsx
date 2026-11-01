// Show a user's photo or initials as a fallback.
export default function UserAvatar({ user, size = 'size-10' }) {
  const initials = (user?.name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return user?.photo_url ? (
    <img src={user.photo_url} alt={`${user.name || 'User'} avatar`} className={`${size} rounded-full object-cover`} />
  ) : (
    <span className={`${size} inline-flex items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700`}>
      {initials}
    </span>
  )
}
