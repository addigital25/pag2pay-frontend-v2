import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'

export default function Bank() {
  const [bankData, setBankData] = useState({
    bankName: '',
    accountType: 'corrente',
    agency: '',
    accountNumber: '',
    cpfCnpj: '',
    holderName: ''
  })

  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aqui você faria a chamada à API para salvar os dados bancários
    console.log('Dados bancários:', bankData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleChange = (e) => {
    setBankData({
      ...bankData,
      [e.target.name]: e.target.value
    })
  }

  const bankList = [
    '001 - Banco do Brasil',
    '033 - Santander',
    '104 - Caixa Econômica Federal',
    '237 - Bradesco',
    '341 - Itaú',
    '260 - Nu Pagamentos (Nubank)',
    '077 - Inter',
    '212 - Banco Original',
    '336 - C6 Bank',
    '290 - PagSeguro',
    'Outro'
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dados Bancários</h1>
          <p className="text-gray-600">Configure sua conta para receber os pagamentos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl">
          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Dados bancários salvos com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <select
                name="bankName"
                value={bankData.bankName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Selecione o banco</option>
                {bankList.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Conta
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="corrente"
                    checked={bankData.accountType === 'corrente'}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Conta Corrente</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="poupanca"
                    checked={bankData.accountType === 'poupanca'}
                    onChange={handleChange}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Conta Poupança</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agência
                </label>
                <input
                  type="text"
                  name="agency"
                  value={bankData.agency}
                  onChange={handleChange}
                  required
                  placeholder="0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número da Conta
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankData.accountNumber}
                  onChange={handleChange}
                  required
                  placeholder="00000-0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF/CNPJ do Titular
              </label>
              <input
                type="text"
                name="cpfCnpj"
                value={bankData.cpfCnpj}
                onChange={handleChange}
                required
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo do Titular
              </label>
              <input
                type="text"
                name="holderName"
                value={bankData.holderName}
                onChange={handleChange}
                required
                placeholder="Nome como aparece na conta bancária"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite o nome exatamente como aparece em sua conta bancária
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Informações Importantes</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Seus dados bancários são criptografados e armazenados com segurança</li>
                      <li>Os pagamentos são processados automaticamente após a confirmação das vendas</li>
                      <li>O repasse ocorre em até 7 dias úteis após a confirmação do pedido</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Salvar Dados Bancários
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
