import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MessageSquare,
  MessageCircle,
  Users,
  FileText,
  Send,
  BarChart3,
  Settings,
  Link as LinkIcon,
  Zap,
  Image as ImageIcon
} from 'lucide-react'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/campaigns', label: 'Campaigns', icon: Send },
  { path: '/media', label: 'Media Library', icon: ImageIcon },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/automation', label: 'Automation', icon: Zap },
  { path: '/whatsapp-setup', label: 'WhatsApp Setup', icon: LinkIcon },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/chatbots', label: 'Chatbot', icon: MessageCircle }
]

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
