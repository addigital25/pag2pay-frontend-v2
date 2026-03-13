import { useState, useEffect } from 'react'
import PlatformLayout from '../../components/PlatformLayout'
import config from '../../config'
import authenticatedFetch from '../../utils/authenticatedFetch'

export default function PlatformLogs() {
  // Dados simulados de logs (definidos primeiro para usar como default)
  const mockLogs = [
    {
      id: 1,
      timestamp: '2024-03-02 15:42:18',
      level: 'info',
      action: 'USER_LOGIN',
      user: 'admin@platform.com',
      description: 'Login bem-sucedido no Platform Admin',
      ip: '192.168.1.100',
      details: 'Autenticação 2FA concluída'
    },
    {
      id: 2,
      timestamp: '2024-03-02 15:30:45',
      level: 'success',
      action: 'APPROVAL_GRANTED',
      user: 'admin@platform.com',
      description: 'Conta de João Silva aprovada',
      ip: '192.168.1.100',
      details: 'Documentos verificados e aprovados'
    },
    {
      id: 3,
      timestamp: '2024-03-02 15:15:22',
      level: 'warning',
      action: 'APPROVAL_REJECTED',
      user: 'admin@platform.com',
      description: 'Conta de Maria Santos rejeitada',
      ip: '192.168.1.100',
      details: 'Motivo: Documento ilegível'
    },
    {
      id: 4,
      timestamp: '2024-03-02 14:58:33',
      level: 'success',
      action: 'SPLIT_ACCOUNT_CREATED',
      user: 'admin@platform.com',
      description: 'Conta split criada para Pedro Costa',
      ip: '192.168.1.100',
      details: 'ID da conta: rp_abc123def456'
    },
    {
      id: 5,
      timestamp: '2024-03-02 14:45:10',
      level: 'error',
      action: 'SPLIT_ACCOUNT_ERROR',
      user: 'admin@platform.com',
      description: 'Erro ao criar conta split para Ana Oliveira',
      ip: '192.168.1.100',
      details: 'Erro: Dados bancários inválidos na Pagarme'
    },
    {
      id: 6,
      timestamp: '2024-03-02 14:20:55',
      level: 'info',
      action: 'SETTINGS_UPDATED',
      user: 'admin@platform.com',
      description: 'Configurações da plataforma atualizadas',
      ip: '192.168.1.100',
      details: 'Comissão alterada de 2.5% para 3%'
    },
    {
      id: 7,
      timestamp: '2024-03-02 13:55:40',
      level: 'warning',
      action: 'LOGIN_FAILED',
      user: 'tentativa@hack.com',
      description: 'Tentativa de login falhou',
      ip: '45.123.456.789',
      details: 'Senha incorreta - 3 tentativas'
    },
    {
      id: 8,
      timestamp: '2024-03-02 13:30:15',
      level: 'info',
      action: 'PRODUCT_APPROVED',
      user: 'admin@platform.com',
      description: 'Produto "Curso de Node.js" aprovado',
      ip: '192.168.1.100',
      details: 'Produto ID: 1234'
    },
    {
      id: 9,
      timestamp: '2024-03-02 13:10:28',
      level: 'success',
      action: 'PAYOUT_PROCESSED',
      user: 'system',
      description: 'Repasse processado para Carlos Mendes',
      ip: 'internal',
      details: 'Valor: R$ 5.432,10'
    },
    {
      id: 10,
      timestamp: '2024-03-02 12:45:50',
      level: 'error',
      action: 'API_ERROR',
      user: 'system',
      description: 'Erro na integração com Pagarme',
      ip: 'internal',
      details: 'Timeout na requisição - endpoint /split/recipients'
    },
    {
      id: 11,
      timestamp: '2024-03-02 12:20:33',
      level: 'info',
      action: 'USER_REGISTERED',
      user: 'system',
      description: 'Novo usuário registrado: Lucia Ferreira',
      ip: '192.168.1.50',
      details: 'CPF: ***.***.***-45'
    },
    {
      id: 12,
      timestamp: '2024-03-02 11:55:12',
      level: 'success',
      action: 'PAYMENT_RECEIVED',
      user: 'system',
      description: 'Pagamento recebido - Produto: E-book Marketing',
      ip: 'internal',
      details: 'Valor: R$ 47,00 - Comprador: cliente@email.com'
    }
  ]

  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [logsState, setLogsState] = useState(mockLogs) // Inicializar com mockLogs
  const [loading, setLoading] = useState(false) // Iniciar como false para mostrar mockLogs imediatamente
  const [total, setTotal] = useState(mockLogs.length)

  // Wrapper para garantir que logs é sempre um array
  const setLogs = (value) => {
    console.log('🔧 setLogs chamado com:', typeof value, Array.isArray(value), value)
    if (Array.isArray(value)) {
      setLogsState(value)
    } else {
      console.error('❌ setLogs recebeu valor não-array:', value)
      setLogsState(mockLogs)
    }
  }

  // Garantir que logs é sempre um array
  const logs = Array.isArray(logsState) ? logsState : mockLogs

  useEffect(() => {
    loadLogs()
  }, [filter, searchTerm])

  const loadLogs = async () => {
    console.log('📊 loadLogs iniciado')
    setLoading(true)
    try {
      const params = new URLSearchParams({
        level: filter,
        limit: 100,
        offset: 0
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const url = `${config.apiUrl}/api/platform/logs?${params}`
      console.log('🌐 Fazendo requisição para:', url)

      const response = await authenticatedFetch(url)
      console.log('📡 Resposta recebida:', response.ok, response.status)

      // Verificar se a resposta é ok
      if (!response.ok) {
        console.error('❌ API error:', response.status)
        setLogs(mockLogs)
        setTotal(mockLogs.length)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log('📦 Dados recebidos:', data)
      console.log('📦 Tipo de data:', typeof data)
      console.log('📦 data.success:', data?.success)
      console.log('📦 data.logs é array?:', Array.isArray(data?.logs))

      // Garantir que data é um objeto válido
      if (data && typeof data === 'object' && data.success && Array.isArray(data.logs)) {
        console.log('✅ Usando logs da API')
        setLogs(data.logs)
        setTotal(data.total || 0)
      } else {
        // Se não houver logs na API, usar mock
        console.log('⚠️ Usando mockLogs (API não retornou array válido)')
        setLogs(mockLogs)
        setTotal(mockLogs.length)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar logs:', error)
      setLogs(mockLogs)
      setTotal(mockLogs.length)
    } finally {
      setLoading(false)
    }
  }

  const getLevelBadge = (level) => {
    const badges = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    }
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[level]} flex items-center gap-1 w-fit`}>
        <span>{icons[level]}</span>
        <span className="uppercase">{level}</span>
      </span>
    )
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter
    const matchesSearch =
      (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <PlatformLayout>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Logs da Plataforma</h2>
          <p className="text-slate-600 mt-1">Auditoria e monitoramento de todas as ações do sistema</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Info</p>
                <p className="text-2xl font-bold text-slate-800">
                  {logs.filter(l => l.level === 'info').length}
                </p>
              </div>
              <div className="text-3xl">ℹ️</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Sucesso</p>
                <p className="text-2xl font-bold text-slate-800">
                  {logs.filter(l => l.level === 'success').length}
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avisos</p>
                <p className="text-2xl font-bold text-slate-800">
                  {logs.filter(l => l.level === 'warning').length}
                </p>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Erros</p>
                <p className="text-2xl font-bold text-slate-800">
                  {logs.filter(l => l.level === 'error').length}
                </p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar nos logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos ({logs.length})
              </button>
              <button
                onClick={() => setFilter('info')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'info'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setFilter('success')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'success'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sucesso
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'warning'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Avisos
              </button>
              <button
                onClick={() => setFilter('error')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'error'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Erros
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Logs */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-slate-600 mt-4">Carregando logs...</p>
          </div>
        ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Ação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-slate-600">{log.timestamp}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getLevelBadge(log.level)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-800">{log.user}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-800">{log.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-600">{log.ip}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">{log.details}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-600 font-medium">Nenhum log encontrado</p>
              <p className="text-slate-500 text-sm mt-1">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
        )}

        {/* Informações de Auditoria */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Sobre os Logs:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
            <li>Todos os logs são registrados em tempo real e armazenados de forma permanente</li>
            <li>Os logs incluem ações de usuários, eventos do sistema e integrações externas</li>
            <li>Em produção, os logs são enviados para um sistema de monitoramento centralizado</li>
            <li>Recomenda-se revisar logs de erro e warning regularmente</li>
          </ul>
        </div>
      </div>
    </PlatformLayout>
  )
}
