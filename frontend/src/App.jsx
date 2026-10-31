import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import PublicNavbar from './components/PublicNavbar'
import { AuthProvider } from './context/AuthContext'
import About from './pages/About'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import ModelInsights from './pages/ModelInsights'
import Login from './pages/Login'
import Predict from './pages/Predict'
import Profile from './pages/Profile'
import Recommendations from './pages/Recommendations'
import Signup from './pages/Signup'
import Upload from './pages/Upload'

// Keep public pages in a simple top-navigation layout.
function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicNavbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main>
      <Footer />
    </div>
  )
}

// Keep application pages in the persistent sidebar layout.
function AppLayout() {
  return <AppShell><Outlet /></AppShell>
}

// Protect one route without duplicating route definitions.
function PrivatePage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

// Define all public and application routes.
function RouteMap() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<PrivatePage><Dashboard /></PrivatePage>} />
        <Route path="/predict" element={<PrivatePage><Predict /></PrivatePage>} />
        <Route path="/upload" element={<PrivatePage><Upload /></PrivatePage>} />
        <Route path="/insights" element={<ModelInsights />} />
        <Route path="/history" element={<PrivatePage><History /></PrivatePage>} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile" element={<PrivatePage><Profile /></PrivatePage>} />
      </Route>
    </Routes>
  )
}

// Start the client-side application.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteMap />
      </AuthProvider>
    </BrowserRouter>
  )
}
