import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'https://pag2pay-backend01-production.up.railway.app'

export default function PlatformLogin() {
  const navigate = useNavigate()
  const { directLogin } = useAuth()

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [customLogo, setCustomLogo] = useState(null)
  const [customTitle, setCustomTitle] = useState('Platform Administration')

  useEffect(() => {
    const loadPlatformSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/platform/settings`)
        if (response.ok) {
          const settings = await response.json()

          if (settings.images?.logoUrl) {
            setCustomLogo(settings.images.logoUrl)
          }

          if (settings.texts?.siteTitle) {
            setCustomTitle(settings.texts.siteTitle)
          }
        }
      } catch (error) {
        console.log('Usando configurações padrão')
      }
    }

    loadPlatformSettings()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Etapa 1: Validar email e senha
      const response = await fetch(`${API_URL}/api/platform/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      // Verificar se precisa de 2FA
      if (data.requiresTwoFactor) {
        // Já tem 2FA configurado - mostrar campo de verificação
        setShowTwoFactor(true)
      } else if (data.token) {
        // 2FA desabilitado - login direto com token
        localStorage.setItem('platform_token', data.token)
        localStorage.setItem('platform_user', JSON.stringify(data.user))
        window.location.href = '/platform/dashboard'
      } else {
        // Primeira vez - gerar QR Code
        await setup2FA(credentials.email)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  const setup2FA = async (email) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/platform/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao configurar 2FA')
        return
      }

      setQrCodeUrl(data.qrCode)
      setSecretKey(data.secret)
      setShow2FASetup(true)
    } catch (error) {
      console.error('Erro ao configurar 2FA:', error)
      setError('Erro ao gerar QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    setError('')

    if (twoFactorCode.length !== 6) {
      setError('Código deve ter 6 dígitos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/platform/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          token: twoFactorCode
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Código inválido')
        setLoading(false)
        return
      }

      // Login bem-sucedido
      directLogin(data.user, data.token)
      navigate('/platform/dashboard')
    } catch (error) {
      console.error('Erro ao verificar 2FA:', error)
      setError('Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setError('')

    if (twoFactorCode.length !== 6) {
      setError('Código deve ter 6 dígitos')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/platform/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          token: twoFactorCode
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Código inválido')
        setLoading(false)
        return
      }

      // Login bem-sucedido
      directLogin(data.user, data.token)
      navigate('/platform/dashboard')
    } catch (error) {
      console.error('Erro ao ativar 2FA:', error)
      setError('Erro ao ativar 2FA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          {customLogo ? (
            <div className="flex justify-center mb-4">
              <img
                src={customLogo}
                alt={customTitle}
                className="h-16 w-auto object-contain"
                style={{ maxWidth: '250px' }}
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-2">{customTitle}</h1>
          <p className="text-slate-300">Controle total da plataforma {customTitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          {/* Formulário de Login Inicial */}
          {!showTwoFactor && !show2FASetup && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Administrador
                </label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@pag2pay.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Entrar
                  </>
                )}
              </button>
            </form>
          )}

          {/* Setup de 2FA (Primeira vez) */}
          {show2FASetup && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Configurar Autenticação em Duas Etapas</h3>
                <p className="text-sm text-gray-600">
                  Escaneie o QR Code com o Google Authenticator ou similar
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
              </div>

              {/* Chave Manual */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-600 mb-2">
                  <strong>Chave Manual (se não conseguir escanear):</strong>
                </p>
                <p className="text-sm font-mono text-slate-800 bg-white px-3 py-2 rounded border border-slate-300 select-all">
                  {secretKey}
                </p>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Como configurar:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Abra o Google Authenticator no celular</li>
                  <li>Toque em "+" e selecione "Escanear código QR"</li>
                  <li>Escaneie o código acima</li>
                  <li>Digite o código de 6 dígitos abaixo</li>
                </ol>
              </div>

              {/* Input de verificação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength="6"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSetup2FA}
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Ativar 2FA e Entrar'}
              </button>
            </div>
          )}

          {/* Verificação 2FA (Logins subsequentes) */}
          {showTwoFactor && !show2FASetup && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Verificação em Duas Etapas</h3>
                <p className="text-sm text-gray-600">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength="6"
                  autoFocus
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && twoFactorCode.length === 6) {
                      handleVerify2FA()
                    }
                  }}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify2FA}
                disabled={loading || twoFactorCode.length !== 6}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar e Entrar'}
              </button>

              <button
                onClick={() => {
                  setShowTwoFactor(false)
                  setTwoFactorCode('')
                  setError('')
                }}
                disabled={loading}
                className="w-full text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50"
              >
                ← Voltar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            🔒 Área restrita - Acesso apenas para administradores da plataforma
          </p>
          <p className="text-slate-500 text-xs mt-2">
            2FA obrigatório para maior segurança
          </p>
        </div>
      </div>
    </div>
  )
}
