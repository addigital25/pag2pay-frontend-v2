import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'
import AlertModal from './AlertModal'
import { useAlert } from '../hooks/useAlert'
import NotificationBell from './NotificationBell'
import UserDropdownMenu from './UserDropdownMenu'

function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { alertState, showAlert, hideAlert } = useAlert()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState({
    produtos: false,
    relatorios: false,
    banco: false,
    configuracoes: false
  })

  // Auto-expandir menus baseado na rota atual
  useEffect(() => {
    setExpandedMenus(prev => {
      const newState = { ...prev }

      // Expandir menu de produtos se estiver em uma rota de produtos
      if (location.pathname.includes('/products')) {
        newState.produtos = true
      }

      // Expandir menu de relatórios se estiver em uma rota de relatórios
      if (location.pathname.includes('/reports')) {
        newState.relatorios = true
      }

      // Expandir menu de banco se estiver em uma rota de banco
      if (location.pathname.includes('/bank')) {
        newState.banco = true
      }

      // Expandir menu de configurações se estiver em uma rota de configurações
      if (location.pathname.includes('/settings')) {
        newState.configuracoes = true
      }

      // Só atualizar o estado se algo mudou
      if (JSON.stringify(prev) !== JSON.stringify(newState)) {
        return newState
      }

      return prev
    })
  }, [location.pathname])

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }))
  }

  // Construir subItems de Produtos baseado no role do usuário
  const productSubItems = [
    { name: 'Meus Produtos', path: '/products/my-products' },
    { name: 'Minhas Afiliações', path: '/products/my-affiliations' }
  ]

  // Adicionar "Aprovação de Produtos" apenas para admins
  if (user?.role === 'admin') {
    productSubItems.push({ name: 'Aprovação de Produtos', path: '/products/approvals', badge: '🔍' })
  }

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Documentos',
      path: '/documents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Produtos',
      key: 'produtos',
      expandable: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      subItems: productSubItems
    },
    {
      name: 'Vitrine',
      path: '/affiliate-store',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Relatórios',
      key: 'relatorios',
      expandable: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      subItems: [
        { name: 'Vendas', path: '/reports/sales' },
        { name: 'After Pay', path: '/reports/afterpay' },
        { name: 'Churn Rate', path: '/reports/churn' },
        { name: 'Abandonos', path: '/reports/abandoned' }
      ]
    },
    {
      name: 'Banco',
      key: 'banco',
      expandable: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      subItems: [
        { name: 'Contas', path: '/bank/accounts' },
        { name: 'Saques', path: '/bank/withdrawals' },
        { name: 'Movimentações', path: '/bank/movements' }
      ]
    },
    {
      name: 'Equipe',
      path: '/team',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Premiações',
      path: user?.role === 'admin' ? '/admin/user-achievements' : '/achievements',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      badge: '🏆'
    },
    {
      name: 'Configurações',
      key: 'configuracoes',
      expandable: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      subItems: [
        { name: 'Webhook', path: '/settings?section=webhook' },
        { name: 'API', path: '/settings?section=api' },
        { name: 'Pixel', path: '/settings?section=pixel' },
        { name: 'Integrações', path: '/settings?section=integration' }
      ]
    }
  ]

  // Adicionar item de Usuários apenas para admins
  const adminMenuItems = user?.role === 'admin' ? [
    ...menuItems,
    {
      name: 'Usuários',
      path: '/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      adminOnly: true
    }
  ] : menuItems

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen ? (
            <Logo textClass="text-2xl" />
          ) : (
            <Logo className="mx-auto" textClass="hidden" />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {adminMenuItems.map((item) => (
            <div key={item.key || item.path}>
              {item.expandable ? (
                <>
                  {/* Menu expansível */}
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={`w-full flex items-center ${
                      sidebarOpen ? 'justify-between px-4' : 'justify-center'
                    } py-3 rounded-lg transition ${
                      location.pathname.includes(
                        item.key === 'produtos' ? '/products' :
                        item.key === 'relatorios' ? '/reports' :
                        item.key === 'banco' ? '/bank' :
                        item.key === 'configuracoes' ? '/settings' : ''
                      )
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      {sidebarOpen && <span className="font-medium">{item.name}</span>}
                    </div>
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
                  </button>

                  {/* Submenu */}
                  {expandedMenus[item.key] && sidebarOpen && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
                      {item.subItems.map((subItem) => {
                        // Verificar se o submenu está ativo
                        // Para paths com query params (ex: /settings?section=webhook)
                        // comparar apenas o pathname base
                        const isSubItemActive = () => {
                          const currentPath = location.pathname + location.search
                          const subItemPathBase = subItem.path.split('?')[0]
                          const currentPathBase = location.pathname

                          // Exata correspondência
                          if (currentPath === subItem.path) return true

                          // Correspondência de base para query params
                          if (subItem.path.includes('?')) {
                            const subItemQuery = subItem.path.split('?')[1]
                            return currentPathBase === subItemPathBase && location.search.includes(subItemQuery)
                          }

                          // Correspondência exata do pathname
                          return location.pathname === subItem.path
                        }

                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center px-4 py-2 rounded-lg transition text-sm ${
                              isSubItemActive()
                                ? 'bg-emerald-600 text-white font-medium'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <span className="mr-2">•</span>
                            {subItem.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Menu normal */
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    sidebarOpen ? 'space-x-3 px-4' : 'justify-center'
                  } py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className={`p-4 border-t border-gray-200 flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 hover:bg-red-50 rounded-lg transition text-red-600"
              title="Sair"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
          </h2>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <NotificationBell userId={user?.id} />

            {/* User Dropdown Menu */}
            <UserDropdownMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </div>
  )
}

export default AdminLayout
