import { useState } from 'react'
import AdminLayout from '../components/AdminLayout'
import AlertModal from '../components/AlertModal'
import { useAlert } from '../hooks/useAlert'

export default function Team() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [teamMembers, setTeamMembers] = useState([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)

  const handleAddMember = () => {
    setCurrentMember({
      id: Date.now(),
      name: '',
      email: '',
      password: '',
      role: 'employee',
      permissions: {
        // Dashboard
        viewDashboard: false,

        // Produtos
        viewProducts: false,
        createProducts: false,
        editProducts: false,
        deleteProducts: false,
        manageAffiliations: false,
        createDiscountCoupons: false,

        // Vendas e Relatórios
        viewSales: false,
        viewReports: false,
        exportReports: false,
        viewAfterPay: false,
        viewChurnRate: false,
        viewAbandoned: false,
        refundSale: false,
        changeBoletoDate: false,
        cancelSale: false,

        // Financeiro
        viewBank: false,
        manageBank: false,
        viewBalance: false,
        requestWithdrawal: false,

        // Webhooks e Integrações
        viewWebhooks: false,
        createWebhooks: false,
        editWebhooks: false,
        deleteWebhooks: false,

        // API
        viewAPI: false,
        createAPI: false,
        editAPI: false,
        deleteAPI: false,

        // Pixel
        viewPixels: false,
        createPixels: false,
        editPixels: false,
        deletePixels: false,

        // Integrações
        viewIntegrations: false,
        manageIntegrations: false,

        // Equipe
        viewTeam: false,
        inviteMembers: false,
        editMembers: false,
        removeMembers: false,
        managePermissions: false
      }
    })
    setShowMemberForm(true)
  }

  const handleEditMember = (member) => {
    setCurrentMember({ ...member })
    setShowMemberForm(true)
  }

  const handleSaveMember = () => {
    if (!currentMember.name || !currentMember.email || !currentMember.password) {
      showAlert('warning', 'Preencha nome, email e senha')
      return
    }

    if (teamMembers.find(m => m.id === currentMember.id)) {
      setTeamMembers(teamMembers.map(m => m.id === currentMember.id ? currentMember : m))
    } else {
      setTeamMembers([...teamMembers, currentMember])
    }

    setShowMemberForm(false)
    setCurrentMember(null)
  }

  const handleDeleteMember = (id) => {
    showAlert(
      'warning',
      'Tem certeza que deseja remover este membro?',
      () => {
        setTeamMembers(teamMembers.filter(m => m.id !== id))
      }
    )
  }

  const togglePermission = (permission) => {
    setCurrentMember({
      ...currentMember,
      permissions: {
        ...currentMember.permissions,
        [permission]: !currentMember.permissions[permission]
      }
    })
  }

  const selectAllInCategory = (permissions) => {
    const updated = { ...currentMember.permissions }
    permissions.forEach(perm => {
      updated[perm] = true
    })
    setCurrentMember({ ...currentMember, permissions: updated })
  }

  const deselectAllInCategory = (permissions) => {
    const updated = { ...currentMember.permissions }
    permissions.forEach(perm => {
      updated[perm] = false
    })
    setCurrentMember({ ...currentMember, permissions: updated })
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Equipe</h2>
            <p className="text-sm text-gray-600">Gerencie os membros da sua equipe e suas permissões</p>
          </div>
          <button
            onClick={handleAddMember}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Membro
          </button>
        </div>

        {/* Lista de Membros */}
        {teamMembers.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">Nenhum membro na equipe. Clique em "Adicionar Membro" para convidar.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissões</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => {
                  const activePermissions = Object.values(member.permissions).filter(p => p).length
                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {member.role === 'admin' ? 'Administrador' : 'Funcionário'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {activePermissions} permissões ativas
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Criar/Editar Membro */}
        {showMemberForm && currentMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-5xl w-full my-8" style={{maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto'}}>
              <h3 className="text-2xl font-bold mb-6">
                {teamMembers.find(m => m.id === currentMember.id) ? 'Editar' : 'Adicionar'} Membro da Equipe
              </h3>

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="border-b pb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentMember.name}
                        onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                        placeholder="Ex: João Silva"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={currentMember.email}
                        onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                        placeholder="joao@empresa.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Senha <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={currentMember.password}
                        onChange={(e) => setCurrentMember({ ...currentMember, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                      <select
                        value={currentMember.role}
                        onChange={(e) => setCurrentMember({ ...currentMember, role: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="employee">Funcionário</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Permissões de Acesso</h4>

                  {/* Dashboard */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Dashboard</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewDashboard'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewDashboard'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewDashboard}
                          onChange={() => togglePermission('viewDashboard')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Dashboard</span>
                      </label>
                    </div>
                  </div>

                  {/* Produtos */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Produtos</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewProducts', 'createProducts', 'editProducts', 'deleteProducts', 'manageAffiliations', 'createDiscountCoupons'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewProducts', 'createProducts', 'editProducts', 'deleteProducts', 'manageAffiliations', 'createDiscountCoupons'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewProducts}
                          onChange={() => togglePermission('viewProducts')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Produtos</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.createProducts}
                          onChange={() => togglePermission('createProducts')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Criar Produtos</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.editProducts}
                          onChange={() => togglePermission('editProducts')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Editar Produtos</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.deleteProducts}
                          onChange={() => togglePermission('deleteProducts')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Excluir Produtos</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.manageAffiliations}
                          onChange={() => togglePermission('manageAffiliations')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Gerenciar Afiliações</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.createDiscountCoupons}
                          onChange={() => togglePermission('createDiscountCoupons')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Criar Cupom de Desconto</span>
                      </label>
                    </div>
                  </div>

                  {/* Vendas e Relatórios */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Vendas e Relatórios</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewSales', 'viewReports', 'exportReports', 'viewAfterPay', 'viewChurnRate', 'viewAbandoned', 'refundSale', 'changeBoletoDate', 'cancelSale'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewSales', 'viewReports', 'exportReports', 'viewAfterPay', 'viewChurnRate', 'viewAbandoned', 'refundSale', 'changeBoletoDate', 'cancelSale'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewSales}
                          onChange={() => togglePermission('viewSales')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Vendas</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewReports}
                          onChange={() => togglePermission('viewReports')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Relatórios</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.exportReports}
                          onChange={() => togglePermission('exportReports')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Exportar Relatórios</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewAfterPay}
                          onChange={() => togglePermission('viewAfterPay')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Ver After Pay</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewChurnRate}
                          onChange={() => togglePermission('viewChurnRate')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Ver Churn Rate</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewAbandoned}
                          onChange={() => togglePermission('viewAbandoned')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Ver Abandonos</span>
                      </label>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-xs text-gray-600 mb-3 italic">
                        * As opções abaixo são aplicáveis apenas para produtos criados pelo usuário (não aparecem para afiliados)
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentMember.permissions.refundSale}
                            onChange={() => togglePermission('refundSale')}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Estorno de Venda</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentMember.permissions.changeBoletoDate}
                            onChange={() => togglePermission('changeBoletoDate')}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Alterar Data do Boleto</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentMember.permissions.cancelSale}
                            onChange={() => togglePermission('cancelSale')}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">Cancelamento de Venda</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Financeiro */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Financeiro</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewBank', 'manageBank', 'viewBalance', 'requestWithdrawal'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewBank', 'manageBank', 'viewBalance', 'requestWithdrawal'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewBank}
                          onChange={() => togglePermission('viewBank')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Banco</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.manageBank}
                          onChange={() => togglePermission('manageBank')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Gerenciar Banco</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewBalance}
                          onChange={() => togglePermission('viewBalance')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Ver Saldo</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.requestWithdrawal}
                          onChange={() => togglePermission('requestWithdrawal')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Solicitar Saque</span>
                      </label>
                    </div>
                  </div>

                  {/* Webhooks */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Webhooks</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewWebhooks', 'createWebhooks', 'editWebhooks', 'deleteWebhooks'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewWebhooks', 'createWebhooks', 'editWebhooks', 'deleteWebhooks'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewWebhooks}
                          onChange={() => togglePermission('viewWebhooks')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Webhooks</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.createWebhooks}
                          onChange={() => togglePermission('createWebhooks')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Criar Webhooks</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.editWebhooks}
                          onChange={() => togglePermission('editWebhooks')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Editar Webhooks</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.deleteWebhooks}
                          onChange={() => togglePermission('deleteWebhooks')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Excluir Webhooks</span>
                      </label>
                    </div>
                  </div>

                  {/* API */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">API</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewAPI', 'createAPI', 'editAPI', 'deleteAPI'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewAPI', 'createAPI', 'editAPI', 'deleteAPI'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewAPI}
                          onChange={() => togglePermission('viewAPI')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar APIs</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.createAPI}
                          onChange={() => togglePermission('createAPI')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Criar APIs</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.editAPI}
                          onChange={() => togglePermission('editAPI')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Editar APIs</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.deleteAPI}
                          onChange={() => togglePermission('deleteAPI')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Excluir APIs</span>
                      </label>
                    </div>
                  </div>

                  {/* Pixels */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Pixels</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewPixels', 'createPixels', 'editPixels', 'deletePixels'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewPixels', 'createPixels', 'editPixels', 'deletePixels'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewPixels}
                          onChange={() => togglePermission('viewPixels')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Pixels</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.createPixels}
                          onChange={() => togglePermission('createPixels')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Criar Pixels</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.editPixels}
                          onChange={() => togglePermission('editPixels')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Editar Pixels</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.deletePixels}
                          onChange={() => togglePermission('deletePixels')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Excluir Pixels</span>
                      </label>
                    </div>
                  </div>

                  {/* Integrações */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Integrações</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewIntegrations', 'manageIntegrations'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewIntegrations', 'manageIntegrations'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewIntegrations}
                          onChange={() => togglePermission('viewIntegrations')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Integrações</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.manageIntegrations}
                          onChange={() => togglePermission('manageIntegrations')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Gerenciar Integrações</span>
                      </label>
                    </div>
                  </div>

                  {/* Equipe */}
                  <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-gray-700">Equipe</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => selectAllInCategory(['viewTeam', 'inviteMembers', 'editMembers', 'removeMembers', 'managePermissions'])}
                          className="text-xs text-emerald-600 hover:text-emerald-800"
                        >
                          Marcar Todos
                        </button>
                        <button
                          onClick={() => deselectAllInCategory(['viewTeam', 'inviteMembers', 'editMembers', 'removeMembers', 'managePermissions'])}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.viewTeam}
                          onChange={() => togglePermission('viewTeam')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Visualizar Equipe</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.inviteMembers}
                          onChange={() => togglePermission('inviteMembers')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Convidar Membros</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.editMembers}
                          onChange={() => togglePermission('editMembers')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Editar Membros</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.removeMembers}
                          onChange={() => togglePermission('removeMembers')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Remover Membros</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentMember.permissions.managePermissions}
                          onChange={() => togglePermission('managePermissions')}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Gerenciar Permissões</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={handleSaveMember}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold"
                >
                  Salvar Membro
                </button>
                <button
                  onClick={() => { setShowMemberForm(false); setCurrentMember(null) }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alertState.isOpen}
        type={alertState.type}
        message={alertState.message}
        onConfirm={alertState.onConfirm}
        onClose={hideAlert}
      />
    </AdminLayout>
  )
}
