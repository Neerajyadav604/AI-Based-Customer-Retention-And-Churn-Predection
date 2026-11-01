import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import GlobalNavbar from './GlobalNavbar'

// Keep public pages inside the shared navbar and footer layout.
export default function PublicLayout() {
  const { pathname } = useLocation()
  const isPricing = pathname === '/pricing'
  const isAuth = pathname === '/login' || pathname === '/signup'

  return (
    <div className={`min-h-screen text-slate-900 ${isAuth ? 'bg-[linear-gradient(115deg,#071426_0%,#0a2850_55%,#111b45_100%)]' : 'bg-slate-50'}`}>
      <GlobalNavbar transparent={isAuth} />
      <main className={`${isAuth ? '' : `mx-auto ${isPricing ? 'max-w-none px-0 py-0' : 'max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}`}`}>
        <Outlet />
      </main>
      {!isPricing && !isAuth && <Footer />}
    </div>
  )
}
