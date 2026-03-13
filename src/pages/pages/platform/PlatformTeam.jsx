import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import axios from 'axios'
import PlatformModal from '../../components/PlatformModal'

export default function PlatformTeam() {
  const API_URL = import.meta.env.VITE_API_URL || 'https://pag2pay-backend01-production.up.railway.app'

  const [activeTab, setActiveTab] = useState('members') // members, roles, activity, stats
  const [teamMembers, setTeamMembers] = useState([])
  const [roles, setRoles] = useState([])
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' })

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    status: 'active',
    avatar: '',
    department: '',
    position: '',
    startDate: '',
    salary: '',
    permissions: []
  })

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    permissions: [],
    level: 1
  })

  // Permissões disponíveis no sistema
  const availablePermissions = [
    { id: 'users_view', name: 'Visualizar Usuários', category: 'Usuários' },
    { id: 'users_edit', name: 'Editar Usuários', category: 'Usuários' },
    { id: 'users_approve', name: 'Aprovar Usuários', category: 'Usuários' },
    { id: 'users_delete', name: 'Excluir Usuários', category: 'Usuários' },

    { id: 'products_view', name: 'Visualizar Produtos', category: 'Produtos' },
    { id: 'products_edit', name: 'Editar Produtos', category: 'Produtos' },
    { id: 'products_approve', name: 'Aprovar Produtos', category: 'Produtos' },
    { id: 'products_delete', name: 'Excluir Produtos', category: 'Produtos' },

    { id: 'financial_view', name: 'Visualizar Financeiro', category: 'Financeiro' },
    { id: 'financial_edit', name: 'Editar Configurações Financeiras', category: 'Financeiro' },
    { id: 'financial_approve_withdrawals', name: 'Aprovar Saques', category: 'Financeiro' },
    { id: 'financial_refunds', name: 'Processar Reembolsos', category: 'Financeiro' },

    { id: 'sales_view', name: 'Visualizar Vendas', category: 'Vendas' },
    { id: 'sales_export', name: 'Exportar Relatórios de Vendas', category: 'Vendas' },

    { id: 'team_view', name: 'Visualizar Equipe', category: 'Equipe' },
    { id: 'team_manage', name: 'Gerenciar Equipe', category: 'Equipe' },
    { id: 'team_roles', name: 'Gerenciar Funções', category: 'Equipe' },

    { id: 'settings_view', name: 'Visualizar Configurações', category: 'Configurações' },
    { id: 'settings_edit', name: 'Editar Configurações', category: 'Configurações' },
    { id: 'settings_platform', name: 'Configurações da Plataforma', category: 'Configurações' },

    { id: 'logs_view', name: 'Visualizar Logs', category: 'Logs' },
    { id: 'logs_export', name: 'Exportar Logs', category: 'Logs' },
  ]

  const departmentOptions = [
    'Administrativo',
    'Financeiro',
    'Tecnologia',
    'Suporte',
    'Comercial',
    'Marketing',
    'Operações',
    'Compliance'
  ]

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'members') {
        await loadTeamMembers()
      } else if (activeTab === 'roles') {
        await loadRoles()
      } else if (activeTab === 'activity') {
        await loadActivities()
      } else if (activeTab === 'stats') {
        await loadStats()
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/platform/team/members`)
      setTeamMembers(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar membros:', error)
      // Dados de exemplo para demonstração
      setTeamMembers([
        {
          id: 1,
          name: 'Admin Principal',
          email: 'admin@platform.com',
          phone: '(11) 98765-4321',
          roleId: 1,
          roleName: 'Administrador',
          roleColor: '#EF4444',
          status: 'active',
          department: 'Administrativo',
          position: 'CEO',
          startDate: '2024-01-01',
          avatar: '',
          lastActivity: '2 minutos atrás',
          actionsCount: 1247
        }
      ])
    }
  }

  const loadRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/platform/team/roles`)
      setRoles(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar funções:', error)
      // Dados de exemplo
      setRoles([
        {
          id: 1,
          name: 'Administrador',
          description: 'Acesso total ao sistema',
          color: '#EF4444',
          level: 10,
          membersCount: 1,
          permissions: availablePermissions.map(p => p.id)
        },
        {
          id: 2,
          name: 'Gerente Financeiro',
          description: 'Gestão de finanças e saques',
          color: '#10B981',
          level: 8,
          membersCount: 0,
          permissions: ['financial_view', 'financial_edit', 'financial_approve_withdrawals', 'financial_refunds', 'sales_view']
        },
        {
          id: 3,
          name: 'Analista de Suporte',
          description: 'Suporte a usuários e produtos',
          color: '#3B82F6',
          level: 5,
          membersCount: 0,
          permissions: ['users_view', 'products_view', 'sales_view']
        }
      ])
    }
  }

  const loadActivities = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/platform/team/activities`)
      setActivities(response.data || [])
    } catch (error) {
      console.error('Erro ao carregar atividades:', error)
      // Dados de exemplo
      setActivities([
        {
          id: 1,
          memberId: 1,
          memberName: 'Admin Principal',
          action: 'Aprovou usuário',
          description: 'João Silva foi aprovado',
          timestamp: new Date().toISOString(),
          type: 'approval',
          ip: '192.168.1.1'
        }
      ])
    }
  }

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/platform/team/stats`)
      setStats(response.data || {})
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      // Dados de exemplo
      setStats({
        totalMembers: 1,
        activeMembers: 1,
        totalRoles: 3,
        todayActions: 12,
        weekActions: 87,
        monthActions: 342,
        mostActiveMembers: [
          { name: 'Admin Principal', actions: 1247, avatar: '' }
        ],
        actionsByType: [
          { type: 'Aprovações', count: 156 },
          { type: 'Edições', count: 98 },
          { type: 'Visualizações', count: 432 }
        ]
      })
    }
  }

  const handleAddMember = () => {
    setEditingMember(null)
    setMemberForm({
      name: '',
      email: '',
      phone: '',
      roleId: '',
      status: 'active',
      avatar: '',
      department: '',
      position: '',
      startDate: '',
      salary: '',
      permissions: []
    })
    setShowMemberModal(true)
  }

  const handleEditMember = (member) => {
    setEditingMember(member)
    setMemberForm({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      roleId: member.roleId,
      status: member.status,
      avatar: member.avatar || '',
      department: member.department || '',
      position: member.position || '',
      startDate: member.startDate || '',
      salary: member.salary || '',
      permissions: member.permissions || []
    })
    setShowMemberModal(true)
  }

  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        await axios.patch(`${API_URL}/api/platform/team/members/${editingMember.id}`, memberForm)
      } else {
        await axios.post(`${API_URL}/api/platform/team/members`, memberForm)
      }
      setShowMemberModal(false)
      loadTeamMembers()
    } catch (error) {
      console.error('Erro ao salvar membro:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Erro ao salvar membro. Tente novamente.'
      })
    }
  }

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return

    try {
      await axios.delete(`${API_URL}/api/platform/team/members/${memberId}`)
      loadTeamMembers()
    } catch (error) {
      console.error('Erro ao deletar membro:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao remover',
        message: 'Erro ao remover membro. Tente novamente.'
      })
    }
  }

  const handleToggleMemberStatus = async (memberId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await axios.patch(`${API_URL}/api/platform/team/members/${memberId}/status`, { status: newStatus })
      loadTeamMembers()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleAddRole = () => {
    setEditingRole(null)
    setRoleForm({
      name: '',
      description: '',
      color: '#3B82F6',
      permissions: [],
      level: 1
    })
    setShowRoleModal(true)
  }

  const handleEditRole = (role) => {
    setEditingRole(role)
    setRoleForm({
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: role.permissions || [],
      level: role.level
    })
    setShowRoleModal(true)
  }

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await axios.patch(`${API_URL}/api/platform/team/roles/${editingRole.id}`, roleForm)
      } else {
        await axios.post(`${API_URL}/api/platform/team/roles`, roleForm)
      }
      setShowRoleModal(false)
      loadRoles()
    } catch (error) {
      console.error('Erro ao salvar função:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Erro ao salvar função. Tente novamente.'
      })
    }
  }

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId)
    if (role && role.membersCount > 0) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Não é possível excluir',
        message: 'Não é possível excluir uma função que possui membros associados.'
      })
      return
    }

    if (!confirm('Tem certeza que deseja excluir esta função?')) return

    try {
      await axios.delete(`${API_URL}/api/platform/team/roles/${roleId}`)
      loadRoles()
    } catch (error) {
      console.error('Erro ao deletar função:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Erro ao excluir',
        message: 'Erro ao excluir função. Tente novamente.'
      })
    }
  }

  const handleTogglePermission = (permissionId) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const getFilteredMembers = () => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || member.roleId === parseInt(filterRole)
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus

      return matchesSearch && matchesRole && matchesStatus
    })
  }

  const groupPermissionsByCategory = () => {
    const grouped = {}
    availablePermissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = []
      }
      grouped[permission.category].push(permission)
    })
    return grouped
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const getActionTypeColor = (type) => {
    const colors = {
      approval: 'bg-green-100 text-green-800',
      edit: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      view: 'bg-gray-100 text-gray-800',
      create: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Ativo</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Inativo</span>
  }

  return (
    <PlatformLayout>
      <div className="p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Equipe</h1>
            <p className="text-slate-600 mt-1">Gerencie membros da equipe, funções e permissões</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddRole}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nova Função
            </button>
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Novo Membro
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-6">
            {[
              { id: 'members', label: 'Membros', icon: '👥' },
              { id: 'roles', label: 'Funções', icon: '🎭' },
              { id: 'activity', label: 'Atividades', icon: '📊' },
              { id: 'stats', label: 'Estatísticas', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-semibold text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Tabs */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Tab: Membros */}
            {activeTab === 'members' && (
              <div className="space-y-4">
                {/* Filtros */}
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
                      <input
                        type="text"
                        placeholder="Nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Função</label>
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Todas</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Lista de Membros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredMembers().map(member => (
                    <div key={member.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{member.name}</h3>
                            <p className="text-sm text-slate-500">{member.position || member.department}</p>
                          </div>
                        </div>
                        {getStatusBadge(member.status)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {member.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${member.roleColor}20`,
                              color: member.roleColor
                            }}
                          >
                            {member.roleName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          <p>Último acesso: {member.lastActivity}</p>
                          <p>{member.actionsCount} ações realizadas</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleMemberStatus(member.id, member.status)}
                            className="text-amber-600 hover:text-amber-800"
                            title={member.status === 'active' ? 'Desativar' : 'Ativar'}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {getFilteredMembers().length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-slate-600 font-medium">Nenhum membro encontrado</p>
                    <p className="text-sm text-slate-500 mt-1">Tente ajustar os filtros ou adicionar novos membros</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Funções */}
            {activeTab === 'roles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map(role => (
                  <div key={role.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: role.color }}
                        >
                          {role.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{role.name}</h3>
                          <p className="text-xs text-slate-500">Nível {role.level}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Excluir"
                          disabled={role.membersCount > 0}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">{role.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Membros:</span>
                        <span className="font-medium text-slate-900">{role.membersCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Permissões:</span>
                        <span className="font-medium text-slate-900">{role.permissions?.length || 0}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-medium text-slate-700 mb-2">Permissões principais:</p>
                      <div className="flex flex-wrap gap-1">
                        {(role.permissions || []).slice(0, 4).map(permId => {
                          const perm = availablePermissions.find(p => p.id === permId)
                          return perm ? (
                            <span key={permId} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                              {perm.name.split(' ').slice(0, 2).join(' ')}
                            </span>
                          ) : null
                        })}
                        {(role.permissions || []).length > 4 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                            +{(role.permissions || []).length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Atividades */}
            {activeTab === 'activity' && (
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Membro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Ação
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          Data/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                          IP
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activities.map(activity => (
                        <tr key={activity.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {activity.memberName.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-slate-900">{activity.memberName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionTypeColor(activity.type)}`}>
                              {activity.action}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-900">{activity.description}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {activity.ip}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {activities.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-slate-600">Nenhuma atividade registrada</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Estatísticas */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total de Membros</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalMembers || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{stats.activeMembers || 0} ativos</p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Ações Hoje</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stats.todayActions || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{stats.weekActions || 0} esta semana</p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Ações no Mês</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stats.monthActions || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Média de {Math.round((stats.monthActions || 0) / 30)} por dia</p>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Funções</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalRoles || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Papéis criados</p>
                  </div>
                </div>

                {/* Membros Mais Ativos */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Membros Mais Ativos</h3>
                  <div className="space-y-3">
                    {(stats.mostActiveMembers || []).map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{member.name}</span>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {member.actions} ações
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações por Tipo */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações por Tipo</h3>
                  <div className="space-y-3">
                    {(stats.actionsByType || []).map((actionType, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-slate-700">{actionType.type}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-48 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(actionType.count / Math.max(...(stats.actionsByType || []).map(a => a.count))) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-900 w-12 text-right">{actionType.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal - Novo/Editar Membro */}
        {showMemberModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingMember ? 'Editar Membro' : 'Novo Membro'}
                </h2>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="João da Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="joao@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 98765-4321"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Função <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={memberForm.roleId}
                      onChange={(e) => setMemberForm({ ...memberForm, roleId: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Departamento
                    </label>
                    <select
                      value={memberForm.department}
                      onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {departmentOptions.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={memberForm.position}
                      onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Gerente, Analista, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      value={memberForm.startDate}
                      onChange={(e) => setMemberForm({ ...memberForm, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      value={memberForm.status}
                      onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveMember}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
                  >
                    {editingMember ? 'Salvar Alterações' : 'Adicionar Membro'}
                  </button>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal - Nova/Editar Função */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingRole ? 'Editar Função' : 'Nova Função'}
                </h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome da Função <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Gerente de Vendas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nível de Acesso (1-10) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={roleForm.level}
                      onChange={(e) => setRoleForm({ ...roleForm, level: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva as responsabilidades desta função..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cor da Função
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={roleForm.color}
                        onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                        className="w-16 h-10 border border-slate-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={roleForm.color}
                        onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissões */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Permissões <span className="text-sm font-normal text-slate-500">({roleForm.permissions.length} selecionadas)</span>
                  </h3>

                  <div className="space-y-4">
                    {Object.entries(groupPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-3">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {permissions.map(permission => (
                            <label key={permission.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                              <input
                                type="checkbox"
                                checked={roleForm.permissions.includes(permission.id)}
                                onChange={() => handleTogglePermission(permission.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700">{permission.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleSaveRole}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {editingRole ? 'Salvar Alterações' : 'Criar Função'}
                  </button>
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg hover:bg-slate-300 transition font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Modal */}
      <PlatformModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </PlatformLayout>
  )
}
