import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import UserStatusGuard from './components/UserStatusGuard'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import MyProducts from './pages/MyProducts'
import MyAffiliations from './pages/MyAffiliations'
import ProductEdit from './pages/ProductEdit'
import AffiliateStore from './pages/AffiliateStore'
import Sales from './pages/Sales'
import AfterPayReports from './pages/AfterPayReports'
import ChurnRate from './pages/ChurnRate'
import Abandoned from './pages/Abandoned'
import Bank from './pages/Bank'
import BankAccounts from './pages/BankAccounts'
import BankWithdrawals from './pages/BankWithdrawals'
import BankMovements from './pages/BankMovements'
import Settings from './pages/Settings'
import NotificationSettings from './pages/NotificationSettings'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import ChangePassword from './pages/ChangePassword'
import UserManagement from './pages/UserManagement'
import Team from './pages/Team'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import PaymentSuccess from './pages/PaymentSuccess'
import ProductView from './pages/ProductView'
import Documents from './pages/Documents'
import UserTerms from './pages/UserTerms'
import UserPrivacy from './pages/UserPrivacy'
import ProductApprovals from './pages/ProductApprovals'

// Auto Login
import AutoLogin from './pages/AutoLogin'

// Maintenance
import Maintenance from './pages/Maintenance'

// Platform Admin imports (Lazy loaded para não carregar quando não necessário)
import PlatformLogin from './pages/platform/PlatformLogin'
const PlatformDashboard = lazy(() => import('./pages/platform/PlatformDashboard'))
const PlatformUsers = lazy(() => import('./pages/platform/PlatformUsers'))
const PlatformProducts = lazy(() => import('./pages/platform/PlatformProducts'))
const PlatformFinancial = lazy(() => import('./pages/platform/PlatformFinancial'))
const PlatformAcquirers = lazy(() => import('./pages/platform/PlatformAcquirers'))
const PagarMeConfig = lazy(() => import('./pages/platform/PagarMeConfig'))
const PlatformFees = lazy(() => import('./pages/platform/PlatformFees'))
const PlatformWithdrawals = lazy(() => import('./pages/platform/PlatformWithdrawals'))
const PlatformRefunds = lazy(() => import('./pages/platform/PlatformRefunds'))
const PlatformSettings = lazy(() => import('./pages/platform/PlatformSettings'))
const PlatformLogs = lazy(() => import('./pages/platform/PlatformLogs'))
const PlatformSales = lazy(() => import('./pages/platform/PlatformSales'))
const PlatformTeam = lazy(() => import('./pages/platform/PlatformTeam'))
import Achievements from './pages/Achievements'
import UserAchievements from './pages/UserAchievements'
import TermsOfUse from './pages/TermsOfUse'
import PrivacyPolicy from './pages/PrivacyPolicy'

// Componente para proteger rotas de usuário
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redireciona para login de usuário se não estiver autenticado
  // E envolve com UserStatusGuard para verificar se usuário foi rejeitado
  return user ? (
    <UserStatusGuard>
      {children}
    </UserStatusGuard>
  ) : (
    <Navigate to="/login" />
  )
}

// Componente removido - logins independentes por URL

// Componente para proteger rotas de Platform Admin
function PlatformRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Carregando...</p>
        </div>
      </div>
    )
  }

  // Apenas platform-admin pode acessar
  if (!user || user.userType !== 'platform-admin') {
    return <Navigate to="/platform/admin" />
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

function AppContent() {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [loadingMaintenance, setLoadingMaintenance] = useState(true)

  // Carregar configurações da plataforma e atualizar favicon e title
  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings')
        if (response.ok) {
          const settings = await response.json()

          // Verificar modo manutenção
          if (settings.extras?.maintenanceMode) {
            setMaintenanceMode(true)
          }

          // Atualizar favicon
          if (settings.images?.faviconUrl) {
            const faviconLink = document.querySelector("link[rel~='icon']") || document.createElement('link')
            faviconLink.type = 'image/x-icon'
            faviconLink.rel = 'icon'
            faviconLink.href = settings.images.faviconUrl
            if (!document.querySelector("link[rel~='icon']")) {
              document.getElementsByTagName('head')[0].appendChild(faviconLink)
            }
          }

          // Atualizar title
          if (settings.texts?.siteTitle) {
            document.title = settings.texts.siteTitle
          }
        }
        setLoadingMaintenance(false)
      } catch (error) {
        console.log('Usando configurações padrão')
        setLoadingMaintenance(false)
      }
    }

    loadPlatformSettings()
  }, [])

  // Verificar se está acessando rotas do Platform Admin
  const isPlatformAdmin = window.location.pathname.startsWith('/platform')

  // Se em manutenção e NÃO for Platform Admin, mostrar tela de manutenção
  if (loadingMaintenance) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  if (maintenanceMode && !isPlatformAdmin) {
    return <Maintenance />
  }

  return (
    <Routes>
      {/* Rotas públicas de login - Independentes */}
      <Route path="/login" element={<Login />} />

      {/* Auto Login - Rota pública para login automático via token */}
      <Route path="/login-auto" element={<AutoLogin />} />

      {/* Rotas públicas de termos e políticas */}
      <Route path="/termos-de-uso" element={<TermsOfUse />} />
      <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />

      {/* Platform Admin Login - Independente */}
      <Route path="/platform/admin" element={<PlatformLogin />} />

      {/* Dashboard - Usuário comum */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <AdminDashboard />
        </PrivateRoute>
      } />

      {/* Produtos */}
      <Route path="/products/my-products" element={
        <PrivateRoute>
          <MyProducts />
        </PrivateRoute>
      } />
      <Route path="/products/my-affiliations" element={
        <PrivateRoute>
          <MyAffiliations />
        </PrivateRoute>
      } />
      <Route path="/products/:productId/edit" element={
        <PrivateRoute>
          <ProductEdit />
        </PrivateRoute>
      } />
      <Route path="/products/approvals" element={
        <PrivateRoute>
          <ProductApprovals />
        </PrivateRoute>
      } />

      {/* Vitrine */}
      <Route path="/affiliate-store" element={
        <PrivateRoute>
          <AffiliateStore />
        </PrivateRoute>
      } />

      {/* Relatórios */}
      <Route path="/reports/sales" element={
        <PrivateRoute>
          <Sales />
        </PrivateRoute>
      } />
      <Route path="/reports/afterpay" element={
        <PrivateRoute>
          <AfterPayReports />
        </PrivateRoute>
      } />
      <Route path="/reports/churn" element={
        <PrivateRoute>
          <ChurnRate />
        </PrivateRoute>
      } />
      <Route path="/reports/abandoned" element={
        <PrivateRoute>
          <Abandoned />
        </PrivateRoute>
      } />

      {/* Banco */}
      <Route path="/bank" element={
        <PrivateRoute>
          <Bank />
        </PrivateRoute>
      } />
      <Route path="/bank/accounts" element={
        <PrivateRoute>
          <BankAccounts />
        </PrivateRoute>
      } />
      <Route path="/bank/withdrawals" element={
        <PrivateRoute>
          <BankWithdrawals />
        </PrivateRoute>
      } />
      <Route path="/bank/movements" element={
        <PrivateRoute>
          <BankMovements />
        </PrivateRoute>
      } />

      {/* Configurações */}
      <Route path="/settings" element={
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      } />

      {/* Notificações */}
      <Route path="/notificacoes" element={
        <PrivateRoute>
          <Notifications />
        </PrivateRoute>
      } />

      {/* Perfil */}
      <Route path="/perfil" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      {/* Alterar Senha */}
      <Route path="/senha" element={
        <PrivateRoute>
          <ChangePassword />
        </PrivateRoute>
      } />

      {/* Configurações de Notificações */}
      <Route path="/settings/notifications" element={
        <PrivateRoute>
          <NotificationSettings />
        </PrivateRoute>
      } />

      {/* Gerenciamento de Usuários - Liberado para todos */}
      <Route path="/users" element={
        <PrivateRoute>
          <UserManagement />
        </PrivateRoute>
      } />

      {/* Equipe */}
      <Route path="/team" element={
        <PrivateRoute>
          <Team />
        </PrivateRoute>
      } />

      {/* Documentos - Para usuários enviarem KYC */}
      <Route path="/documents" element={
        <PrivateRoute>
          <Documents />
        </PrivateRoute>
      } />

      {/* Termos de Uso para usuários logados */}
      <Route path="/user-terms" element={
        <PrivateRoute>
          <UserTerms />
        </PrivateRoute>
      } />

      {/* Política de Privacidade para usuários logados */}
      <Route path="/user-privacy" element={
        <PrivateRoute>
          <UserPrivacy />
        </PrivateRoute>
      } />

      {/* Premiações/Conquistas */}
      <Route path="/achievements" element={
        <PrivateRoute>
          <Achievements />
        </PrivateRoute>
      } />

      {/* Premiações dos Usuários (Admin) */}
      <Route path="/admin/user-achievements" element={
        <PrivateRoute>
          <UserAchievements />
        </PrivateRoute>
      } />

      {/* ========== PLATFORM ADMIN ROUTES ========== */}

      {/* Platform Admin Dashboard */}
      <Route path="/platform/dashboard" element={
        <PlatformRoute>
          <PlatformDashboard />
        </PlatformRoute>
      } />

      {/* Platform Admin - Usuários */}
      <Route path="/platform/users" element={
        <PlatformRoute>
          <PlatformUsers />
        </PlatformRoute>
      } />

      {/* Platform Admin - Aprovações (Redirecionado para Usuários) */}
      <Route path="/platform/approvals" element={<Navigate to="/platform/users" replace />} />

      {/* Platform Admin - Produtos */}
      <Route path="/platform/products" element={
        <PlatformRoute>
          <PlatformProducts />
        </PlatformRoute>
      } />

      {/* Platform Admin - Vendas */}
      <Route path="/platform/sales" element={
        <PlatformRoute>
          <PlatformSales />
        </PlatformRoute>
      } />

      {/* Platform Admin - Financeiro */}
      <Route path="/platform/financial" element={
        <PlatformRoute>
          <PlatformFinancial />
        </PlatformRoute>
      } />

      {/* Platform Admin - Financeiro > Adquirentes */}
      <Route path="/platform/financial/acquirers" element={
        <PlatformRoute>
          <PlatformAcquirers />
        </PlatformRoute>
      } />

      {/* Platform Admin - Financeiro > Configuração Pagar.me */}
      <Route path="/platform/financial/acquirers/pagarme" element={
        <PlatformRoute>
          <PagarMeConfig />
        </PlatformRoute>
      } />

      {/* Platform Admin - Financeiro > Taxas */}
      <Route path="/platform/financial/fees" element={
        <PlatformRoute>
          <PlatformFees />
        </PlatformRoute>
      } />

      {/* Platform Admin - Financeiro > Saques */}
      <Route path="/platform/financial/withdrawals" element={
        <PlatformRoute>
          <PlatformWithdrawals />
        </PlatformRoute>
      } />

      {/* Platform Admin - Financeiro > Reembolsos */}
      <Route path="/platform/financial/refunds" element={
        <PlatformRoute>
          <PlatformRefunds />
        </PlatformRoute>
      } />

      {/* Platform Admin - Configurações */}
      <Route path="/platform/settings" element={
        <PlatformRoute>
          <PlatformSettings />
        </PlatformRoute>
      } />

      {/* Platform Admin - Equipe */}
      <Route path="/platform/team" element={
        <PlatformRoute>
          <PlatformTeam />
        </PlatformRoute>
      } />

      {/* Platform Admin - Logs */}
      <Route path="/platform/logs" element={
        <PlatformRoute>
          <PlatformLogs />
        </PlatformRoute>
      } />

      {/* Redirecionamento de /platform para /platform/dashboard */}
      <Route path="/platform" element={<Navigate to="/platform/dashboard" replace />} />

      {/* ========== FIM PLATFORM ADMIN ROUTES ========== */}

      {/* Rotas públicas para checkout */}
      <Route path="/checkout/:productId" element={<Checkout />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />

      {/* Rota pública para visualização de produto (convite de afiliado) */}
      <Route path="/produto/:productId" element={<ProductView />} />

      {/* Redirect /admin para /dashboard (User area) */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

      {/* Redirect padrão - rota raiz vai para login de usuário (VERDE) */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
