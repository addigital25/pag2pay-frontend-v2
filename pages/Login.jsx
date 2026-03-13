import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import config from '../config'
import Logo from '../components/Logo'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Estados para 2FA
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState(false)
  const [tempUserId, setTempUserId] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  // Função para formatar telefone quando o usuário sair do campo
  const formatPhoneOnBlur = () => {
    const phone = formData.phone
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '')

    // Se não houver números, não faz nada
    if (!numbers) return

    // Formata o telefone
    let formatted = ''
    if (numbers.length <= 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      formatted = numbers.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3')
    } else {
      // Celular: (XX) XXXXX-XXXX
      formatted = numbers.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
    }

    // Remove hífen extra se não houver dígitos depois
    formatted = formatted.replace(/-$/, '')

    setFormData({
      ...formData,
      phone: formatted
    })
  }

  // Função para fechar modal de sucesso e ir para login
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    setIsLogin(true)
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: ''
    })
    setAcceptedTerms(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (isLogin) {
      // Login apenas de usuário
      const result = await login(formData.email, formData.password, 'user')
      if (result.success) {
        // Verificar se o usuário tem 2FA ativado
        // TODO: Esta verificação virá da API real
        const userHas2FA = false // Substituir por: result.user?.twoFactorEnabled

        if (userHas2FA) {
          // Requer verificação 2FA
          setTempUserId(result.user?.id)
          setRequiresTwoFactor(true)
          setLoading(false)
          return
        }

        // Login sem 2FA - prosseguir normalmente
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    } else {
      // Criar conta de usuário
      try {
        const response = await fetch(`${config.apiUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            type: 'user'
          })
        })

        const data = await response.json()

        if (data.success) {
          // Mostrar modal de sucesso
          setShowSuccessModal(true)
          setLoading(false)
        } else {
          // Formatar erros de senha de forma amigável
          if (data.errors && Array.isArray(data.errors)) {
            setError(
              <div>
                <strong>{data.error}</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {data.errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )
          } else {
            setError(data.error || 'Erro ao criar conta')
          }
        }
      } catch (err) {
        setError('Erro ao processar solicitação')
      }
    }

    setLoading(false)
  }

  const handleVerify2FALogin = async () => {
    setLoading(true)
    setTwoFactorError(false)

    // TODO: Validar código 2FA com a API
    // const response = await fetch(`${config.apiUrl}/api/auth/verify-2fa`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId: tempUserId, code: twoFactorCode })
    // })

    // Simulação temporária - aceitar código "123456" como válido
    if (twoFactorCode === '123456') {
      // Código válido - completar login
      navigate('/dashboard')
    } else {
      // Código inválido
      setTwoFactorError(true)
      setTwoFactorCode('')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="scale-150" textClass="text-3xl" />
          </div>
          <p className="text-gray-600 mt-2 text-sm">Plataforma de Vendas e Afiliados</p>
        </div>

        {/* Verificação 2FA */}
        {requiresTwoFactor ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Autenticação de Dois Fatores</h2>
              <p className="text-gray-600 mt-2 text-sm">
                Digite o código de 6 dígitos do seu aplicativo autenticador
              </p>
            </div>

            {/* Campo de Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Código de Verificação
              </label>
              <input
                type="text"
                maxLength="6"
                value={twoFactorCode}
                onChange={(e) => {
                  setTwoFactorCode(e.target.value.replace(/\D/g, ''))
                  setTwoFactorError(false)
                }}
                placeholder="000000"
                className="w-full px-4 py-4 text-center text-3xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center mt-2">
                Use Google Authenticator ou Authy
              </p>
            </div>

            {/* Erro de código inválido */}
            {twoFactorError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Código inválido. Tente novamente.
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="space-y-3">
              <button
                onClick={handleVerify2FALogin}
                disabled={twoFactorCode.length !== 6 || loading}
                className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Verificando...' : 'Verificar e Entrar'}
              </button>

              <button
                onClick={() => {
                  setRequiresTwoFactor(false)
                  setTwoFactorCode('')
                  setTwoFactorError(false)
                  setTempUserId(null)
                }}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                ← Voltar
              </button>
            </div>

            {/* Link para problemas */}
            <div className="text-center">
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-700">
                Problemas para acessar? Entre em contato
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs Login/Criar Conta */}
            <div className="flex mb-6 bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                  setSuccess('')
                }}
                className={`flex-1 py-2.5 rounded-md font-medium transition ${
                  isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                  setSuccess('')
                }}
                className={`flex-1 py-2.5 rounded-md font-medium transition ${
                  !isLogin ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Seu nome completo"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="seu@email.com"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={formatPhoneOnBlur}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="(00) 00000-0000"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            {!isLogin ? (
              // Modo de registro - mostrar validador de senha forte
              <PasswordStrengthMeter
                password={formData.password}
                onChange={(value) => setFormData({ ...formData, password: value })}
              />
            ) : (
              // Modo de login - campo com ícone de olho
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Checkbox de Termos (apenas no modo Criar Conta) */}
          {!isLogin && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded mt-0.5 focus:ring-emerald-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">
                  Li e aceito os{' '}
                  <a
                    href="/termos-de-uso"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-emerald-600 hover:text-emerald-700 underline font-medium"
                  >
                    Termos de Uso
                  </a>
                  {' '}e a{' '}
                  <a
                    href="/politica-de-privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-emerald-600 hover:text-emerald-700 underline font-medium"
                  >
                    Política de Privacidade
                  </a>
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && !acceptedTerms)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <p>
              Não tem uma conta?{' '}
              <button
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                }}
                className="text-emerald-600 font-medium hover:underline"
              >
                Criar agora
              </button>
            </p>
          ) : (
            <p>
              Já tem uma conta?{' '}
              <button
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                }}
                className="text-emerald-600 font-medium hover:underline"
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
          </>
        )}
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-fade-in">
            {/* Ícone de Sucesso */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
              Conta Criada com Sucesso!
            </h2>

            {/* Mensagem */}
            <p className="text-center text-gray-600 mb-6">
              Sua conta foi criada com sucesso. Agora você pode fazer login com seu email e senha.
            </p>

            {/* Botão OK */}
            <button
              onClick={handleSuccessModalClose}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition font-bold text-lg shadow-lg"
            >
              OK, Fazer Login
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
