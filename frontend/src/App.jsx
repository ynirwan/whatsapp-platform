import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import Contacts from './pages/Contacts'
import Templates from './pages/Templates'
import Campaigns from './pages/Campaigns'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import WhatsAppSetup from './pages/WhatsAppSetup'
import Automation from './pages/Automation'
import Chatbots from './pages/Chatbots';
import ChatbotBuilder from './pages/ChatbotBuilder';
import RuleBuilder from './components/chatbot/RuleBuilder';
import ChatTester from './components/chatbot/ChatTester';

// Layout
import MainLayout from './components/layout/MainLayout'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="contacts" element={<Contacts />} />
	    <Route path="templates" element={<Templates />} /> 
            <Route path="campaigns" element={<Campaigns />} /> 
            <Route path="analytics" element={<Analytics />} /> 
            <Route path="settings" element={<Settings />} /> 
	    <Route path="whatsapp-setup" element={<WhatsAppSetup />} />
	    <Route path="automation" element={<Automation />} />
	    <Route path="/chatbots" element={<Chatbots />} />
            <Route path="/chatbots/create" element={<ChatbotBuilder />} />
            <Route path="/chatbots/:id/edit" element={<ChatbotBuilder />} />
            <Route path="/chatbots/:id/rules" element={<RuleBuilder />} />
            <Route path="/chatbots/:id/test" element={<ChatTester />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}

export default App
