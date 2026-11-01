const paths = {
  overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  predict: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
  upload: <><path d="M12 16V4" /><path d="m8 8 4-4 4 4" /><path d="M5 14v5h14v-5" /></>,
  insights: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M7 15v-3M12 15V8M17 15v-6" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 2" /></>,
  recommendations: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.2 14.5A7 7 0 1 1 16 14c-.8.6-1.4 1.4-1.7 2.3H9.7a5.2 5.2 0 0 0-1.5-1.8Z" /></>,
  profile: <><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  chevron: <path d="m7 10 5 5 5-5" />,
}

export default function Icon({ name, size = 18, className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] || paths.overview}
    </svg>
  )
}
