import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import config from '../config'

function AutoLogin() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [status, setStatus] = useState('processing') // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const processAutoLogin = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setErrorMessage('Token não fornecido. O link é inválido.')
        return
      }

      try {
        setStatus('processing')

        // Chamar endpoint de auto-login
        const response = await fetch(`${config.apiUrl}/api/auto-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        })

        const data = await response.json()

        if (data.success && data.user) {
          // Login bem-sucedido
          setStatus('success')

          // Salvar usuário no localStorage via AuthContext
          if (loginWithToken) {
            loginWithToken(data.user)
          } else {
            // Fallback: salvar manualmente
            localStorage.setItem('user', JSON.stringify(data.user))
          }

          // Redirecionar para dashboard após 1 segundo
          setTimeout(() => {
            navigate('/dashboard')
          }, 1000)
        } else {
          setStatus('error')
          setErrorMessage(data.error || data.message || 'Erro ao fazer login automático')
        }
      } catch (error) {
        console.error('Erro no auto-login:', error)
        setStatus('error')
        setErrorMessage('Erro ao conectar com o servidor. Tente novamente.')
      }
    }

    processAutoLogin()
  }, [searchParams, navigate, loginWithToken])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Autenticando...</h2>
            <p className="text-slate-600">Verificando credenciais de acesso...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">✅ Login bem-sucedido!</h2>
            <p className="text-slate-600">Redirecionando para o painel...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-4">❌ Erro no Login</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Possíveis causas:</p>
              <ul className="text-xs text-slate-500 text-left space-y-1">
                <li>• O link expirou (válido por apenas 60 segundos)</li>
                <li>• O link já foi usado anteriormente</li>
                <li>• O link foi copiado incorretamente</li>
              </ul>
            </div>
            <button
              onClick={() => window.close()}
              className="mt-6 w-full bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Fechar esta aba
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AutoLogin
