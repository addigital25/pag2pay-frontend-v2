import { useState } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import AlertModal from '../../components/AlertModal'
import { useAlert } from '../../hooks/useAlert'

export default function PlatformApprovals() {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [filter, setFilter] = useState('pending')
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState('kyc')
  const [rejectionReason, setRejectionReason] = useState('')
  const [observations, setObservations] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  })

  // Dados simulados
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'João Silva Santos',
      email: 'joao@email.com',
      accountType: 'pf',
      cpfCnpj: '123.456.789-00',
      submitDate: '2024-01-15T14:30:00',
      status: 'pending',
      kyc: {
        fullName: 'João Silva Santos',
        cpf: '123.456.789-00',
        birthDate: '1985-03-15',
        phone: '(11) 98765-4321',
        email: 'joao@email.com',
        cep: '01234-567',
        address: 'Rua das Flores, 123 - Apto 45',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP'
      },
      documents: {
        selfie: '/uploads/selfie1.jpg',
        idFront: '/uploads/id_front1.jpg',
        idBack: '/uploads/id_back1.jpg'
      },
      bankData: {
        bank: '341 - Itaú Unibanco',
        agency: '1234',
        account: '12345-6',
        accountType: 'corrente',
        holder: 'João Silva Santos',
        holderDoc: '123.456.789-00',
        pixKey: '123.456.789-00',
        pixKeyType: 'CPF'
      }
    },
    {
      id: 2,
      name: 'Tech Solutions LTDA',
      email: 'contato@techsolutions.com',
      accountType: 'pj',
      cpfCnpj: '12.345.678/0001-90',
      submitDate: '2024-01-14T09:15:00',
      status: 'pending',
      kyc: {
        companyName: 'Tech Solutions LTDA',
        tradeName: 'Tech Solutions',
        cnpj: '12.345.678/0001-90',
        companyOpeningDate: '2020-05-10',
        legalRepresentative: 'Maria Oliveira',
        legalRepresentativeCpf: '987.654.321-00',
        phone: '(11) 3333-4444',
        email: 'contato@techsolutions.com',
        cep: '04567-890',
        address: 'Av. Paulista, 1000 - Sala 501',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      },
      documents: {
        selfie: '/uploads/selfie2.jpg',
        idFront: '/uploads/id_front2.jpg',
        idBack: '/uploads/id_back2.jpg',
        socialContract: '/uploads/contrato_social.pdf'
      },
      bankData: {
        bank: '001 - Banco do Brasil',
        agency: '5678',
        account: '98765-4',
        accountType: 'corrente',
        holder: 'Tech Solutions LTDA',
        holderDoc: '12.345.678/0001-90',
        pixKey: '12.345.678/0001-90',
        pixKeyType: 'CNPJ'
      }
    }
  ])

  const filteredUsers = users.filter(u => u.status === filter)

  const handleApprove = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Aprovação',
      message: `Tem certeza que deseja aprovar a conta de ${selectedUser.name}?`,
      onConfirm: () => {
        setUsers(users.map(u =>
          u.id === selectedUser.id ? { ...u, status: 'approved' } : u
        ))
        showAlert({
          title: 'Sucesso!',
          message: 'Conta aprovada com sucesso!',
          type: 'success'
        })
        setSelectedUser(null)
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })
      }
    })
  }

  const handleReject = () => {
    if (!rejectionReason) {
      showAlert({
        title: 'Atenção',
        message: 'Selecione o motivo da rejeição',
        type: 'warning'
      })
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Rejeição',
      message: `Tem certeza que deseja rejeitar a conta de ${selectedUser.name}?`,
      onConfirm: () => {
        setUsers(users.map(u =>
          u.id === selectedUser.id ? { ...u, status: 'rejected', rejectionReason } : u
        ))
        showAlert({
          title: 'Conta Rejeitada',
          message: 'A conta foi rejeitada com sucesso.',
          type: 'error'
        })
        setSelectedUser(null)
        setRejectionReason('')
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })
      }
    })
  }

  const openUserDetails = (user) => {
    setSelectedUser(user)
    setActiveTab('kyc')
    setObservations('')
    setRejectionReason('')
  }

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Aprovações de Contas</h2>
          <p className="text-sm text-slate-600">Analise e aprove documentos de usuários</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            🟡 Pendentes ({users.filter(u => u.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            🟢 Aprovadas
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'rejected'
                ? 'bg-red-100 text-red-800 border-2 border-red-300'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            🔴 Rejeitadas
          </button>
        </div>

        {/* Tabela de Aprovações */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome/Empresa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">CPF/CNPJ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Envio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Nenhuma conta {filter === 'pending' ? 'pendente' : filter === 'approved' ? 'aprovada' : 'rejeitada'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {user.accountType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.cpfCnpj}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(user.submitDate).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => openUserDetails(user)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Detalhes */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-4xl my-8" style={{maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto'}}>
              {/* Header do Modal */}
              <div className="bg-slate-800 text-white px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">Análise de Conta - {selectedUser.name}</h3>
                    <p className="text-sm text-slate-300">
                      {selectedUser.cpfCnpj} • {selectedUser.accountType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Enviado em {new Date(selectedUser.submitDate).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-slate-300 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Abas */}
              <div className="border-b border-slate-200 bg-slate-50 px-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('kyc')}
                    className={`px-4 py-3 font-medium border-b-2 transition ${
                      activeTab === 'kyc'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    📋 KYC
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`px-4 py-3 font-medium border-b-2 transition ${
                      activeTab === 'documents'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    📄 Documentos
                  </button>
                  <button
                    onClick={() => setActiveTab('bank')}
                    className={`px-4 py-3 font-medium border-b-2 transition ${
                      activeTab === 'bank'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    🏦 Dados Bancários
                  </button>
                </div>
              </div>

              {/* Conteúdo das Abas */}
              <div className="p-6">
                {/* ABA KYC */}
                {activeTab === 'kyc' && (
                  <div className="space-y-4">
                    {selectedUser.accountType === 'pf' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500">Nome Completo</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.fullName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">CPF</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.cpf}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Data de Nascimento</label>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(selectedUser.kyc.birthDate).toLocaleDateString('pt-BR')} ({new Date().getFullYear() - new Date(selectedUser.kyc.birthDate).getFullYear()} anos)
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Telefone</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs font-medium text-slate-500">Email</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.email}</p>
                        </div>
                        <div className="col-span-2 pt-3 border-t">
                          <label className="text-xs font-medium text-slate-500">Endereço Completo</label>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedUser.kyc.address}<br/>
                            {selectedUser.kyc.neighborhood} - {selectedUser.kyc.city}/{selectedUser.kyc.state}<br/>
                            CEP: {selectedUser.kyc.cep}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500">Razão Social</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.companyName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Nome Fantasia</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.tradeName}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">CNPJ</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.cnpj}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Data de Abertura</label>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(selectedUser.kyc.companyOpeningDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Responsável Legal</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.legalRepresentative}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">CPF do Responsável</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.legalRepresentativeCpf}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Telefone</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.phone}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500">Email</label>
                          <p className="text-sm font-medium text-slate-900">{selectedUser.kyc.email}</p>
                        </div>
                        <div className="col-span-2 pt-3 border-t">
                          <label className="text-xs font-medium text-slate-500">Endereço Completo</label>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedUser.kyc.address}<br/>
                            {selectedUser.kyc.neighborhood} - {selectedUser.kyc.city}/{selectedUser.kyc.state}<br/>
                            CEP: {selectedUser.kyc.cep}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ABA DOCUMENTOS */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <h4 className="font-semibold text-slate-800 mb-3">📸 Selfie com Documento</h4>
                      <div className="bg-slate-200 h-48 rounded flex items-center justify-center">
                        <p className="text-slate-500 text-sm">[Imagem: {selectedUser.documents.selfie}]</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="text-sm text-blue-600 hover:underline">👁️ Visualizar em Tela Cheia</button>
                        <button className="text-sm text-slate-600 hover:underline">⬇️ Baixar</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-800 mb-3">🆔 Documento - Frente</h4>
                        <div className="bg-slate-200 h-32 rounded flex items-center justify-center">
                          <p className="text-slate-500 text-sm">[Imagem: {selectedUser.documents.idFront}]</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="text-sm text-blue-600 hover:underline">👁️ Ver</button>
                          <button className="text-sm text-slate-600 hover:underline">⬇️ Baixar</button>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-800 mb-3">🆔 Documento - Verso</h4>
                        <div className="bg-slate-200 h-32 rounded flex items-center justify-center">
                          <p className="text-slate-500 text-sm">[Imagem: {selectedUser.documents.idBack}]</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="text-sm text-blue-600 hover:underline">👁️ Ver</button>
                          <button className="text-sm text-slate-600 hover:underline">⬇️ Baixar</button>
                        </div>
                      </div>
                    </div>

                    {selectedUser.accountType === 'pj' && selectedUser.documents.socialContract && (
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-slate-800 mb-3">📋 Contrato Social</h4>
                        <div className="bg-red-50 border border-red-200 rounded p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="font-medium text-slate-900">contrato_social.pdf</p>
                              <p className="text-xs text-slate-500">{selectedUser.documents.socialContract}</p>
                            </div>
                          </div>
                          <button className="text-sm text-blue-600 hover:underline font-medium">📄 Abrir PDF</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ABA DADOS BANCÁRIOS */}
                {activeTab === 'bank' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500">Banco</label>
                        <p className="text-sm font-medium text-slate-900">{selectedUser.bankData.bank}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Tipo de Conta</label>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedUser.bankData.accountType === 'corrente' ? 'Conta Corrente' : 'Conta Poupança'}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Agência</label>
                        <p className="text-sm font-medium text-slate-900">{selectedUser.bankData.agency}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Conta</label>
                        <p className="text-sm font-medium text-slate-900">{selectedUser.bankData.account}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Titular</label>
                        <p className="text-sm font-medium text-slate-900">{selectedUser.bankData.holder}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">CPF/CNPJ do Titular</label>
                        <p className="text-sm font-medium text-slate-900">{selectedUser.bankData.holderDoc}</p>
                      </div>
                      {selectedUser.bankData.pixKey && (
                        <div className="col-span-2 pt-3 border-t">
                          <label className="text-xs font-medium text-slate-500">Chave PIX</label>
                          <p className="text-sm font-medium text-slate-900">
                            {selectedUser.bankData.pixKey} ({selectedUser.bankData.pixKeyType})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Observações e Ações */}
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Observações (Opcional)
                    </label>
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Adicione observações sobre esta aprovação..."
                    />
                  </div>

                  {selectedUser.status === 'pending' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Motivo de Rejeição (se aplicável)
                        </label>
                        <select
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        >
                          <option value="">Selecione o motivo</option>
                          <option value="documento_ilegivel">Documento ilegível</option>
                          <option value="selfie_nao_confere">Selfie não confere com documento</option>
                          <option value="dados_inconsistentes">Dados inconsistentes</option>
                          <option value="documento_vencido">Documento vencido</option>
                          <option value="outro">Outro (especificar nas observações)</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleReject}
                          className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rejeitar Conta
                        </button>
                        <button
                          onClick={handleApprove}
                          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Aprovar Conta
                        </button>
                      </div>
                    </>
                  )}

                  {selectedUser.status === 'approved' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-800 font-medium">✅ Conta aprovada</p>
                    </div>
                  )}

                  {selectedUser.status === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800 font-medium">❌ Conta rejeitada</p>
                      {selectedUser.rejectionReason && (
                        <p className="text-red-700 text-sm mt-2">Motivo: {selectedUser.rejectionReason}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AlertModal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />

      {/* Modal de Confirmação */}
      {confirmDialog.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícone */}
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {confirmDialog.title}
            </h2>

            {/* Mensagem */}
            <p className="text-gray-600 mb-6">
              {confirmDialog.message}
            </p>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </PlatformLayout>
  )
}
