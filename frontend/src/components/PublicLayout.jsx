import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import GlobalNavbar from './GlobalNavbar'

// Premium editorial layout with warm cream/beige base.
export default function PublicLayout() {
  const { pathname } = useLocation()
  const isPricing = pathname === '/pricing'
  const isAuth = pathname === '/login' || pathname === '/signup' || pathname === '/verify-email'

  return (
    <div
      className={`min-h-screen text-[#291C2E] flex flex-col justify-between ${
        isAuth
          ? 'bg-[#291C2E]'
          : 'bg-[#FFF3E4]'
      }`}
    >
      <GlobalNavbar transparent={isAuth} />
      <main
        className={`flex-1 ${
          isAuth
            ? ''
            : isPricing
            ? 'w-full'
            : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
        }`}
      >
        <Outlet />
      </main>
      {!isAuth && <Footer />}
    </div>
  )
}
