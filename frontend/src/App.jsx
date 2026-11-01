import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import ProtectedRoute from './components/ProtectedRoute'
import WorkspaceLayout from './components/WorkspaceLayout'
import { AuthProvider } from './context/AuthContext'
import { PlanProvider } from './context/PlanContext'
import About from './pages/About'
import Admin from './pages/Admin'
import Contact from './pages/Contact'
import Docs from './pages/Docs'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import ModelInsights from './pages/ModelInsights'
import Login from './pages/Login'
import Predict from './pages/Predict'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import Recommendations from './pages/Recommendations'
import Signup from './pages/Signup'
import Upload from './pages/Upload'
import Onboarding from './pages/Onboarding'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Predictions from './pages/Predictions'
import AuthCallback from './pages/AuthCallback'
import VerifyEmail from './pages/VerifyEmail'

// Define all public and application routes.
function RouteMap() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/workspace" element={<ProtectedRoute><WorkspaceLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="predict" element={<Predict />} />
        <Route path="upload" element={<Upload />} />
        <Route path="insights" element={<ModelInsights />} />
        <Route path="history" element={<History />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Start the client-side application.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlanProvider>
          <RouteMap />
        </PlanProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
