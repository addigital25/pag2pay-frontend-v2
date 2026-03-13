import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://pag2pay-backend01-production.up.railway.app'

export default function PasswordStrengthMeter({ password, onChange }) {
  const [validation, setValidation] = useState({
    valid: false,
    errors: [],
    strength: 'Muito Fraca',
    score: 0
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!password) {
      setValidation({
        valid: false,
        errors: [],
        strength: 'Muito Fraca',
        score: 0
      })
      return
    }

    // Debounce para não fazer requisição a cada tecla
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/validate-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        })

        if (response.ok) {
          const data = await response.json()
          setValidation(data)
        }
      } catch (error) {
        console.error('Erro ao validar senha:', error)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [password])

  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'Muito Forte':
        return 'bg-green-500'
      case 'Forte':
        return 'bg-green-400'
      case 'Média':
        return 'bg-yellow-500'
      case 'Fraca':
        return 'bg-orange-500'
      default:
        return 'bg-red-500'
    }
  }

  const getStrengthWidth = () => {
    const percentage = (validation.score / 9) * 100
    return `${Math.min(percentage, 100)}%`
  }

  const requirements = [
    { label: 'Mínimo 8 caracteres', met: password && password.length >= 8 },
    { label: 'Letra minúscula (a-z)', met: /[a-z]/.test(password) },
    { label: 'Letra maiúscula (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Número (0-9)', met: /[0-9]/.test(password) },
    { label: 'Caractere especial (!@#$%)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]

  return (
    <div className="space-y-3">
      {/* Campo de senha */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Digite uma senha forte"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

      {/* Barra de força da senha */}
      {password && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Força da senha:</span>
            <span className={`font-semibold ${
              validation.strength === 'Muito Forte' ? 'text-green-600' :
              validation.strength === 'Forte' ? 'text-green-500' :
              validation.strength === 'Média' ? 'text-yellow-600' :
              validation.strength === 'Fraca' ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {validation.strength}
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: getStrengthWidth() }}
            />
          </div>
        </div>
      )}

      {/* Requisitos */}
      {password && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Requisitos de segurança:</p>
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {req.met ? (
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className={req.met ? 'text-gray-700' : 'text-gray-500'}>
                {req.label}
              </span>
            </div>
          ))}

          {/* Erros adicionais */}
          {validation.errors.length > 0 && !validation.valid && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-red-600 mt-1">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensagem de sucesso */}
      {validation.valid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-green-700 font-medium">
            ✓ Senha forte! Todos os requisitos foram atendidos.
          </span>
        </div>
      )}

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex gap-2">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Dica de segurança:</p>
            <p>Use uma frase ou combinação de palavras que você se lembre facilmente, mas difícil para outros adivinharem. Exemplo: <span className="font-mono bg-blue-100 px-1 rounded">Cafe@2026!Forte</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
