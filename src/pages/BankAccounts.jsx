import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'

export default function BankAccounts() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [accounts, setAccounts] = useState([])
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [currentAccount, setCurrentAccount] = useState(null)

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

  const handleAddAccount = () => {
    setCurrentAccount({
      id: Date.now(),
      bankName: '',
      accountType: 'corrente',
      agency: '',
      accountNumber: '',
      cpfCnpj: '',
      holderName: '',
      pixKey: '',
      pixKeyType: 'cpf',
      status: 'active'
    })
    setShowAccountForm(true)
  }

  const handleEditAccount = (account) => {
    setCurrentAccount({ ...account })
    setShowAccountForm(true)
  }

  const handleSaveAccount = () => {
    if (!currentAccount.bankName || !currentAccount.agency || !currentAccount.accountNumber || !currentAccount.cpfCnpj || !currentAccount.holderName) {
      showAlert({
        title: 'Atenção',
        message: 'Preencha todos os campos obrigatórios',
        type: 'warning'
      })
      return
    }

    if (accounts.find(a => a.id === currentAccount.id)) {
      setAccounts(accounts.map(a => a.id === currentAccount.id ? currentAccount : a))
      showAlert({
        title: 'Sucesso!',
        message: 'Conta atualizada com sucesso!',
        type: 'success'
      })
    } else {
      setAccounts([...accounts, currentAccount])
      showAlert({
        title: 'Sucesso!',
        message: 'Conta adicionada com sucesso!',
        type: 'success'
      })
    }

    setShowAccountForm(false)
    setCurrentAccount(null)
  }

  const handleDeleteAccount = (id) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      setAccounts(accounts.filter(a => a.id !== id))
      showAlert({
        title: 'Sucesso!',
        message: 'Conta excluída com sucesso!',
        type: 'success'
      })
    }
  }

  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ))
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Contas Bancárias</h2>
            <p className="text-sm text-gray-600">Gerencie suas contas para recebimento</p>
          </div>
          <button
            onClick={handleAddAccount}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Conta
          </button>
        </div>

        {/* Lista de Contas */}
        {accounts.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Nenhuma conta cadastrada. Clique em "Adicionar Conta" para começar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titular</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agência</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chave PIX</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{account.bankName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{account.holderName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {account.accountType === 'corrente' ? 'Corrente' : 'Poupança'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.agency}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.accountNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {account.pixKey ? (
                        <div>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {account.pixKeyType.toUpperCase()}
                          </span>
                          <div className="text-xs mt-1">{account.pixKey}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleAccountStatus(account.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          account.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {account.status === 'active' ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Criar/Editar Conta */}
        {showAccountForm && currentAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-3xl w-full my-8" style={{maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto'}}>
              <h3 className="text-2xl font-bold mb-6">
                {accounts.find(a => a.id === currentAccount.id) ? 'Editar' : 'Adicionar'} Conta Bancária
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentAccount.bankName}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, bankName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Selecione o banco</option>
                    {bankList.map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={currentAccount.accountType === 'corrente'}
                        onChange={() => setCurrentAccount({ ...currentAccount, accountType: 'corrente' })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Conta Corrente</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={currentAccount.accountType === 'poupanca'}
                        onChange={() => setCurrentAccount({ ...currentAccount, accountType: 'poupanca' })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Conta Poupança</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agência <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentAccount.agency}
                      onChange={(e) => setCurrentAccount({ ...currentAccount, agency: e.target.value })}
                      placeholder="0000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número da Conta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentAccount.accountNumber}
                      onChange={(e) => setCurrentAccount({ ...currentAccount, accountNumber: e.target.value })}
                      placeholder="00000-0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF/CNPJ do Titular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentAccount.cpfCnpj}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, cpfCnpj: e.target.value })}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo do Titular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentAccount.holderName}
                    onChange={(e) => setCurrentAccount({ ...currentAccount, holderName: e.target.value })}
                    placeholder="Nome como aparece na conta bancária"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Campo PIX */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Chave PIX (Opcional)</h4>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Chave PIX</label>
                    <select
                      value={currentAccount.pixKeyType}
                      onChange={(e) => setCurrentAccount({ ...currentAccount, pixKeyType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="email">E-mail</option>
                      <option value="telefone">Telefone</option>
                      <option value="aleatoria">Chave Aleatória</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                    <input
                      type="text"
                      value={currentAccount.pixKey}
                      onChange={(e) => setCurrentAccount({ ...currentAccount, pixKey: e.target.value })}
                      placeholder={
                        currentAccount.pixKeyType === 'cpf' ? '000.000.000-00' :
                        currentAccount.pixKeyType === 'cnpj' ? '00.000.000/0000-00' :
                        currentAccount.pixKeyType === 'email' ? 'seu@email.com' :
                        currentAccount.pixKeyType === 'telefone' ? '(00) 00000-0000' :
                        'Chave aleatória'
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAccountForm(false)
                      setCurrentAccount(null)
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAccount}
                    className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    Salvar Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </AdminLayout>
  )
}
