// Shared dark split layout for login and signup.
import { Link } from 'react-router-dom'

export default function AuthPageShell({ children, title, switchText, switchLabel, switchTo, illustration }) {
  return (
    <div className="auth-page min-h-screen bg-[linear-gradient(115deg,#071426_0%,#0a2850_55%,#111b45_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 pb-12 pt-28 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-slate-400">{switchText} <Link to={switchTo} className="font-medium text-white hover:text-blue-300">{switchLabel}</Link></p>
          </div>
          {children}
        </div>
        <div className="hidden min-h-[460px] items-center justify-center lg:flex">{illustration}</div>
      </div>
    </div>
  )
}
