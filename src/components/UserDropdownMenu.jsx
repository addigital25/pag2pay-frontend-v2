import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function UserDropdownMenu() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Carregar contador de notificações
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount()
      // Poll a cada 5 segundos para notificações imediatas
      const interval = setInterval(loadUnreadCount, 5000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const loadUnreadCount = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/notifications`)
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount)
      } else {
        // Silenciar erro 401/404 para não poluir console
        setUnreadCount(0)
      }
    } catch (error) {
      // Silenciar erros de rede
      setUnreadCount(0)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNavigation = (path) => {
    navigate(path)
    setShowDropdown(false)
  }

  if (!user) return null

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const getFirstName = (name) => {
    if (!name) return 'Usuário'
    return name.split(' ')[0]
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Menu */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-2 transition"
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
          {getInitials(user.name)}
        </div>

        {/* Nome (desktop) */}
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {getFirstName(user.name)}
        </span>

        {/* Seta */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header com info do usuário */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                {user.status && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Aprovado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Perfil */}
            <button
              onClick={() => handleNavigation('/perfil')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition w-full text-left"
            >
              <span className="text-lg">👤</span>
              <span className="text-gray-700">Perfil</span>
              <svg className="w-4 h-4 text-gray-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Senha */}
            <button
              onClick={() => handleNavigation('/senha')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition w-full text-left"
            >
              <span className="text-lg">🔑</span>
              <span className="text-gray-700">Senha</span>
              <svg className="w-4 h-4 text-gray-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Notificações */}
            <button
              onClick={() => handleNavigation('/notificacoes')}
              className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition w-full text-left"
            >
              <span className="text-lg">🔔</span>
              <div className="flex-1">
                <span className="text-gray-700">Notificações</span>
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition w-full text-left"
            >
              <span className="text-lg">🚪</span>
              <span className="text-red-600 font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
