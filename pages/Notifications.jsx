import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminLayout from '../components/AdminLayout'

export default function Notifications() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('notifications')
  const [notifications, setNotifications] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
      loadSettings()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/notifications`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/notification-settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })
      loadNotifications()
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/notifications/mark-all-read`, {
        method: 'POST'
      })
      loadNotifications()
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const updateSettings = async (updates) => {
    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/notification-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
        alert('Configurações salvas com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações')
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionButton?.link) {
      navigate(notification.actionButton.link)
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

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return n.type === filter
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AdminLayout>
      <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🔔 Notificações</h1>
        <p className="text-gray-600">Gerencie suas notificações e preferências</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === 'notifications'
                ? 'border-emerald-600 text-emerald-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            📬 Notificações {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-1 border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            ⚙️ Configurações
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'notifications' && (
        <div>
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    filter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    filter === 'unread'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Não lidas
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    filter === 'read'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lidas
                </button>
                <button
                  onClick={() => setFilter('sale_new')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    filter === 'sale_new'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💰 Vendas
                </button>
                <button
                  onClick={() => setFilter('commission_received')}
                  className={`px-3 py-1.5 rounded text-sm transition ${
                    filter === 'commission_received'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💵 Comissões
                </button>
              </div>

              {/* Mark All as Read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition"
                >
                  ✓ Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-gray-600 text-lg mb-2">Nenhuma notificação encontrada</p>
              <p className="text-gray-500 text-sm">
                {filter !== 'all' ? 'Tente ajustar os filtros' : 'Você não tem notificações ainda'}
              </p>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition ${
                    !notification.read
                      ? notification.important
                        ? 'border-l-4 border-l-green-500 bg-green-50'
                        : 'border-l-4 border-l-yellow-500 bg-yellow-50'
                      : 'border-gray-200 border-l-4 border-l-gray-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Status Indicator */}
                      <div className="text-2xl mt-1">
                        {!notification.read ? (
                          notification.important ? '🟢' : '🟡'
                        ) : (
                          '⚪'
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {!notification.read && (
                              <span className="text-emerald-600">[NOVA] </span>
                            )}
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            📅 {formatDate(notification.createdAt)}
                          </span>
                        </div>

                        {/* Message */}
                        <p className="text-gray-700 mb-3">{notification.message}</p>

                        {/* Action Button */}
                        {notification.actionButton && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNotificationClick(notification)
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium"
                          >
                            <span>{notification.actionButton.icon}</span>
                            <span>{notification.actionButton.text}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && settings && (
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">⚙️ Configurações de Notificações</h2>

            {/* Email Notifications */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📧 Notificações por E-mail
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">💰 Vendas</span>
                  <input
                    type="checkbox"
                    checked={settings.email.sales}
                    onChange={(e) => updateSettings({
                      email: { ...settings.email, sales: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">💵 Comissões</span>
                  <input
                    type="checkbox"
                    checked={settings.email.commissions}
                    onChange={(e) => updateSettings({
                      email: { ...settings.email, commissions: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">📦 Produtos</span>
                  <input
                    type="checkbox"
                    checked={settings.email.products}
                    onChange={(e) => updateSettings({
                      email: { ...settings.email, products: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">📄 Documentos</span>
                  <input
                    type="checkbox"
                    checked={settings.email.documents}
                    onChange={(e) => updateSettings({
                      email: { ...settings.email, documents: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">💸 Saques</span>
                  <input
                    type="checkbox"
                    checked={settings.email.withdrawals}
                    onChange={(e) => updateSettings({
                      email: { ...settings.email, withdrawals: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">ℹ️ Mensagens da Plataforma</span>
                  <input
                    type="checkbox"
                    checked={settings.email.platformMessages}
                    onChange={(e) => updateSettings({
                      email: { ...settings.email, platformMessages: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* Web Notifications */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🌐 Notificações Web
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">Ativar notificações web</span>
                  <input
                    type="checkbox"
                    checked={settings.web.enabled}
                    onChange={(e) => updateSettings({
                      web: { ...settings.web, enabled: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">🔊 Som</span>
                  <input
                    type="checkbox"
                    checked={settings.web.sound}
                    onChange={(e) => updateSettings({
                      web: { ...settings.web, sound: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                  <span className="text-gray-700">🖥️ Notificações Desktop</span>
                  <input
                    type="checkbox"
                    checked={settings.web.desktop}
                    onChange={(e) => updateSettings({
                      web: { ...settings.web, desktop: e.target.checked }
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  )
}
