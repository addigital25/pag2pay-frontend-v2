import { useState, useEffect } from 'react'

export default function EditBankModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    bankName: '',
    bankCode: '',
    accountType: '',
    agency: '',
    account: '',
    accountDigit: '',
    holderName: '',
    holderDocument: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      // Preencher formulário com dados atuais do usuário
      setFormData({
        bankName: user.formData?.bankName || '',
        bankCode: user.formData?.bankCode || '',
        accountType: user.formData?.accountType || 'corrente',
        agency: user.formData?.agency || '',
        account: user.formData?.account || '',
        accountDigit: user.formData?.accountDigit || '',
        holderName: user.formData?.holderName || user.name || '',
        holderDocument: user.formData?.holderDocument || user.cpf || user.cnpj || ''
      })
    }
  }, [isOpen, user])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Chamar API para salvar dados bancários
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/platform/users/${user.id}/edit-bank`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankData: formData })
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar dados bancários')
      }

      const result = await response.json()
      onSave(result)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar dados bancários:', error)
      alert('Erro ao salvar dados bancários. Por favor, tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const bancos = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '237', name: 'Bradesco' },
    { code: '104', name: 'Caixa Econômica Federal' },
    { code: '033', name: 'Santander' },
    { code: '341', name: 'Itaú' },
    { code: '077', name: 'Banco Inter' },
    { code: '260', name: 'Nu Pagamentos (Nubank)' },
    { code: '290', name: 'PagSeguro' },
    { code: '323', name: 'Mercado Pago' },
    { code: '212', name: 'Banco Original' },
    { code: '756', name: 'Bancoob (Sicoob)' },
    { code: '748', name: 'Sicredi' },
    { code: '422', name: 'Banco Safra' },
    { code: '041', name: 'Banrisul' },
    { code: '389', name: 'Banco Mercantil' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">✏️ Editar Dados Bancários</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-1">Usuário: {user?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Informações do Banco */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações do Banco</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Banco *
                </label>
                <select
                  name="bankCode"
                  value={formData.bankCode}
                  onChange={(e) => {
                    const selected = bancos.find(b => b.code === e.target.value)
                    setFormData(prev => ({
                      ...prev,
                      bankCode: e.target.value,
                      bankName: selected ? `${selected.code} - ${selected.name}` : ''
                    }))
                  }}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione o banco...</option>
                  {bancos.map(banco => (
                    <option key={banco.code} value={banco.code}>
                      {banco.code} - {banco.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Conta *
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Conta Poupança</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Agência *
                </label>
                <input
                  type="text"
                  name="agency"
                  value={formData.agency}
                  onChange={handleChange}
                  required
                  placeholder="0000"
                  maxLength="4"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Conta *
                </label>
                <input
                  type="text"
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  required
                  placeholder="00000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dígito *
                </label>
                <input
                  type="text"
                  name="accountDigit"
                  value={formData.accountDigit}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  maxLength="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Informações do Titular */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações do Titular</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome do Titular *
                </label>
                <input
                  type="text"
                  name="holderName"
                  value={formData.holderName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {user?.accountType === 'pf' ? 'CPF do Titular' : 'CNPJ do Titular'} *
                </label>
                <input
                  type="text"
                  name="holderDocument"
                  value={formData.holderDocument}
                  onChange={handleChange}
                  required
                  placeholder={user?.accountType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
