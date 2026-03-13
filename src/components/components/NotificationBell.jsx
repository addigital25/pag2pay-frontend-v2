import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (userId) {
      loadNotifications()
      // Poll a cada 5 segundos para notificações imediatas
      const interval = setInterval(loadNotifications, 5000)
      return () => clearInterval(interval)
    }
  }, [userId])

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

  const loadNotifications = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${userId}/notifications`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications.slice(0, 5)) // Apenas últimas 5
        setUnreadCount(data.unreadCount)
      } else {
        // Silenciar erro 401/404 para não poluir console
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (error) {
      // Silenciar erros de rede
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${userId}/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      loadNotifications()
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${userId}/notifications/mark-all-read`, {
        method: 'POST'
      })
      loadNotifications()
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const handleNotificationClick = (notification) => {
    // Marca como lida
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navega se tiver link
    if (notification.actionButton?.link) {
      navigate(notification.actionButton.link)
      setShowDropdown(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days === 1) return 'Ontem'
    if (days < 7) return `${days} dias atrás`
    return date.toLocaleDateString('pt-BR')
  }

  const getNotificationIcon = (type) => {
    const icons = {
      sale_new: '💰',
      commission_received: '💵',
      product_approved: '✅',
      product_rejected: '❌',
      document_approved: '📄',
      document_rejected: '⚠️',
      withdrawal_approved: '💰',
      withdrawal_rejected: '❌',
      platform_message: 'ℹ️',
      welcome: '👋'
    }
    return icons[type] || '🔔'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h3 className="font-bold text-gray-800">🔔 Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-emerald-600 hover:text-emerald-700 transition"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="p-8 text-center text-gray-500">
              Carregando...
            </div>
          )}

          {/* Lista de Notificações */}
          {!loading && notifications.length > 0 && (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    !notification.read
                      ? notification.important
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'bg-yellow-50 border-l-4 border-yellow-500'
                      : 'bg-white border-l-4 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Indicador */}
                    <div className="mt-1 text-lg">
                      {!notification.read ? (
                        notification.important ? '🟢' : '🟡'
                      ) : (
                        '⚪'
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Título */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {!notification.read && (
                            <span className="text-emerald-600">[NOVA] </span>
                          )}
                          {notification.title}
                        </h4>
                      </div>

                      {/* Mensagem */}
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Data e Botão */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          📅 {formatDate(notification.createdAt)}
                        </p>

                        {notification.actionButton && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNotificationClick(notification)
                            }}
                            className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-xs transition"
                          >
                            <span>{notification.actionButton.icon}</span>
                            <span>Ver</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sem notificações */}
          {!loading && notifications.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p>Nenhuma notificação</p>
            </div>
          )}

          {/* Footer - Ver todas */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
              <button
                onClick={() => {
                  navigate('/notificacoes')
                  setShowDropdown(false)
                }}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
              >
                Ver todas as notificações ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
