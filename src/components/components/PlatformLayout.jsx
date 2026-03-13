import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePlatformNotifications } from '../hooks/usePlatformNotifications'

function PlatformLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState({
    financeiro: false
  })
  const { notifications } = usePlatformNotifications()

  // Debug: Log das notificações
  useEffect(() => {
    console.log('🔔 PlatformLayout - Notificações recebidas:', notifications)
  }, [notifications])

  // Auto-expandir menu Financeiro quando estiver em uma rota de financeiro
  useEffect(() => {
    if (location.pathname.includes('/platform/financial')) {
      setExpandedMenus(prev => ({
        ...prev,
        financeiro: true
      }))
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/platform/admin')
  }

  const toggleMenu = (key) => {
    setExpandedMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }))

    // Se clicar no menu Financeiro e houver saques pendentes, redirecionar
    if (key === 'financeiro' && notifications.pendingWithdrawals > 0) {
      navigate('/platform/financial/withdrawals')
    }
  }

  // Função para lidar com clique em menu ativo (recarrega a página sem piscar)
  const handleMenuClick = (path, event) => {
    if (location.pathname === path) {
      event.preventDefault()
      console.log('🔄 Atualizando página:', path)
      // Força re-renderização sem recarregar a página inteira
      navigate(path, { replace: true, state: { refresh: Date.now() } })
    }
  }

  // Debug: Mostrar valores das badges
  console.log('🏷️ Badge Usuários:', notifications.pendingUsers > 0 ? notifications.pendingUsers : null)
  console.log('🏷️ Badge Produtos:', notifications.pendingProducts > 0 ? notifications.pendingProducts : null)
  console.log('🏷️ Badge Financeiro:', notifications.pendingWithdrawals > 0 ? notifications.pendingWithdrawals : null)

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/platform/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      name: 'Usuários',
      path: '/platform/users',
      badge: notifications.pendingUsers > 0 ? notifications.pendingUsers : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Produtos',
      path: '/platform/products',
      badge: notifications.pendingProducts > 0 ? notifications.pendingProducts : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Vendas',
      path: '/platform/sales',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Financeiro',
      key: 'financeiro',
      expandable: true,
      badge: notifications.pendingWithdrawals > 0 ? notifications.pendingWithdrawals : null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      subItems: [
        { name: 'Visão Geral', path: '/platform/financial' },
        { name: 'Adquirentes', path: '/platform/financial/acquirers' },
        { name: 'Taxas', path: '/platform/financial/fees' },
        { name: 'Saques', path: '/platform/financial/withdrawals', badge: notifications.pendingWithdrawals > 0 ? notifications.pendingWithdrawals : null },
        { name: 'Reembolsos', path: '/platform/financial/refunds' }
      ]
    },
    {
      name: 'Equipe',
      path: '/platform/team',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Configurações',
      path: '/platform/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Logs',
      path: '/platform/logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ]

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
      <div className="min-h-screen bg-slate-100">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full bg-slate-800 text-white transition-all duration-300 z-30 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 bg-slate-900">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-lg">Platform Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="mt-6 px-3 overflow-y-auto custom-scrollbar" style={{ height: 'calc(100vh - 64px - 160px)', paddingBottom: '20px' }}>
          {menuItems.map((item) => (
            <div key={item.key || item.path}>
              {item.expandable ? (
                <>
                  {/* Menu expansível */}
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center ${
                      sidebarOpen ? 'justify-between px-3' : 'justify-center'
                    } py-3 rounded-lg mb-1 transition-colors relative ${
                      location.pathname.includes('/platform/financial')
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {sidebarOpen && <span className="font-medium">{item.name}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {sidebarOpen && item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {sidebarOpen && (
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            expandedMenus[item.key] ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                    {!sidebarOpen && item.badge && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Submenu */}
                  {expandedMenus[item.key] && sidebarOpen && (
                    <div className="ml-3 mt-1 space-y-1 border-l-2 border-slate-600 pl-3 mb-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={(e) => handleMenuClick(subItem.path, e)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg transition text-sm ${
                            location.pathname === subItem.path
                              ? 'bg-blue-600 text-white font-medium'
                              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">•</span>
                            {subItem.name}
                          </div>
                          {subItem.badge && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Menu normal */
                <Link
                  to={item.path}
                  onClick={(e) => handleMenuClick(item.path, e)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors relative ${
                    location.pathname === item.path
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && (
                    <>
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900">
          {sidebarOpen ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
                  PA
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Platform Admin</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              title="Sair"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <div className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-bold text-slate-800">Platform Administration</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
    </>
  )
}

export default PlatformLayout
