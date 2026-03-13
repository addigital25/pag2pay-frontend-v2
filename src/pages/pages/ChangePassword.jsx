import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import AdminLayout from '../components/AdminLayout'

export default function ChangePassword() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validations
    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres')
      return
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(formData.newPassword)
    const hasLowerCase = /[a-z]/.test(formData.newPassword)
    const hasNumber = /\d/.test(formData.newPassword)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      if (response.ok) {
        setSuccess('Senha alterada com sucesso!')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      setError('Erro ao alterar senha. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🔑 Alterar Senha</h1>
        <p className="text-gray-600">Mantenha sua conta segura com uma senha forte</p>
      </div>

      <div className="max-w-2xl">
        {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            🛡️ Dicas de Segurança
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use no mínimo 8 caracteres</li>
            <li>• Combine letras maiúsculas e minúsculas</li>
            <li>• Inclua números e caracteres especiais (!@#$%)</li>
            <li>• Evite informações pessoais óbvias</li>
            <li>• Não reutilize senhas de outros sites</li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 flex items-center gap-2">
                  <span>❌</span>
                  <span>{error}</span>
                </p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 flex items-center gap-2">
                  <span>✅</span>
                  <span>{success}</span>
                </p>
              </div>
            )}

            {/* Current Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.newPassword && (
                <div className="mt-3">
                  <PasswordStrengthMeter password={formData.newPassword} />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="mt-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <span>✓</span>
                      <span>As senhas coincidem</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>✗</span>
                      <span>As senhas não coincidem</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : '🔐 Alterar Senha'}
              </button>
            </div>
          </div>
        </form>

        {/* Additional Security Info */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
            ⚠️ Importante
          </h3>
          <p className="text-sm text-yellow-700">
            Após alterar sua senha, você será mantido conectado neste dispositivo.
            Se você não reconhece esta atividade, entre em contato com o suporte imediatamente.
          </p>
        </div>
      </div>
    </div>
    </AdminLayout>
  )
}
