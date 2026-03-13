import { useState, useEffect } from 'react'

export default function RequestEditModal({ isOpen, onClose, userId, onSuccess }) {
  const [selectedSections, setSelectedSections] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setSelectedSections([]) // Reset selection when modal opens
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sections = [
    { id: 'kyc', label: 'Dados Pessoais (KYC)', icon: '🏠' },
    { id: 'documentos', label: 'Documentos', icon: '📄' },
    { id: 'dadosBancarios', label: 'Conta Bancária', icon: '🏦' }
  ]

  const handleToggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleSubmit = async () => {
    if (selectedSections.length === 0) {
      alert('Selecione pelo menos uma seção para editar')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/users/${userId}/request-edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sections: selectedSections })
      })

      if (!response.ok) {
        throw new Error('Erro ao solicitar alteração')
      }

      const result = await response.json()
      onSuccess(result)
      onClose()
    } catch (error) {
      console.error('Erro ao solicitar alteração:', error)
      alert('Erro ao solicitar alteração. Por favor, tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">📝 Solicitar Alteração de Dados</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Seus dados foram aprovados. Para fazer alterações, selecione quais seções você deseja editar e clique em confirmar.
          </p>

          <div className="space-y-3 mb-6">
            {sections.map(section => (
              <label
                key={section.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedSections.includes(section.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedSections.includes(section.id)}
                  onChange={() => handleToggleSection(section.id)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <span className="ml-3 flex items-center gap-2 text-gray-800 font-medium">
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </span>
              </label>
            ))}
          </div>

          {selectedSections.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Atenção</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ao confirmar, você poderá editar as seções selecionadas. Após salvar as alterações, elas passarão por uma nova aprovação.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedSections.length === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : '✓ Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
