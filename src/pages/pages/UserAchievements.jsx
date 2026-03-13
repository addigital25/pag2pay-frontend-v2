import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import config from '../config'

export default function UserAchievements() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userAchievements, setUserAchievements] = useState([])
  const [loadingAchievements, setLoadingAchievements] = useState(false)

  useEffect(() => {
    fetchUsersWithAchievements()
  }, [])

  const fetchUsersWithAchievements = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.apiUrl}/api/admin/users-achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAchievements = async (userId, userName) => {
    setLoadingAchievements(true)
    setSelectedUser({ id: userId, name: userName })

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.apiUrl}/api/admin/user/${userId}/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserAchievements(data)
      }
    } catch (error) {
      console.error('Erro ao carregar premiações do usuário:', error)
    } finally {
      setLoadingAchievements(false)
    }
  }

  const getTierColor = (tier) => {
    const colors = {
      common: '#94a3b8',
      uncommon: '#10b981',
      rare: '#3b82f6',
      epic: '#a855f7',
      milestone: '#f59e0b',
      physical_reward: '#ef4444'
    }
    return colors[tier] || '#94a3b8'
  }

  const getTierName = (tier) => {
    const names = {
      common: 'Comum',
      uncommon: 'Incomum',
      rare: 'Rara',
      epic: 'Épica',
      milestone: 'Marco',
      physical_reward: 'Placa Física'
    }
    return names[tier] || tier
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Premiações dos Usuários</h2>
          <p className="text-sm text-gray-600">Veja todas as conquistas desbloqueadas por cada usuário</p>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total de Premiações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Desbloqueadas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placas Físicas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {user.totalAchievements || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        ✓ {user.unlockedAchievements || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                        🏆 {user.physicalRewards || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => fetchUserAchievements(user.id, user.name)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Premiações
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal de Premiações do Usuário */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg sticky top-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">🏆 Premiações de {selectedUser.name}</h3>
                    <p className="text-sm text-indigo-100">
                      {userAchievements.filter(a => a.isUnlocked).length} de {userAchievements.length} conquistas desbloqueadas
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null)
                      setUserAchievements([])
                    }}
                    className="text-indigo-100 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Conteúdo */}
              <div className="p-6">
                {loadingAchievements ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : userAchievements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500">Este usuário ainda não possui premiações</p>
                  </div>
                ) : (
                  <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">✅</div>
                        <div className="text-2xl font-bold text-green-700">
                          {userAchievements.filter(a => a.isUnlocked).length}
                        </div>
                        <div className="text-sm text-green-600">Desbloqueadas</div>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🔒</div>
                        <div className="text-2xl font-bold text-gray-700">
                          {userAchievements.filter(a => !a.isUnlocked).length}
                        </div>
                        <div className="text-sm text-gray-600">Bloqueadas</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-2xl font-bold text-amber-700">
                          {userAchievements.filter(a => a.hasPhysicalReward && a.isUnlocked).length}
                        </div>
                        <div className="text-sm text-amber-600">Placas Físicas</div>
                      </div>
                    </div>

                    {/* Grid de Conquistas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className={`border-2 rounded-lg p-4 transition ${
                            achievement.isUnlocked
                              ? 'bg-white border-green-300 shadow-md'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                          style={{
                            borderColor: achievement.isUnlocked ? getTierColor(achievement.tier) : '#e5e7eb'
                          }}
                        >
                          {/* Badge de Placa Física */}
                          {achievement.hasPhysicalReward && achievement.isUnlocked && (
                            <div className="mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                🎁 PLACA FÍSICA
                              </span>
                            </div>
                          )}

                          {/* Ícone */}
                          <div className="text-5xl mb-3 text-center">
                            {achievement.icon}
                          </div>

                          {/* Nome */}
                          <h4 className="text-sm font-bold text-gray-900 mb-1 text-center">
                            {achievement.name}
                          </h4>

                          {/* Tier */}
                          <div className="text-center mb-2">
                            <span
                              className="inline-block px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: getTierColor(achievement.tier) }}
                            >
                              {getTierName(achievement.tier)}
                            </span>
                          </div>

                          {/* Descrição */}
                          <p
                            className="text-xs text-gray-600 text-center mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: achievement.description }}
                          />

                          {/* Status */}
                          <div className="text-center">
                            {achievement.isUnlocked ? (
                              <>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mb-1">
                                  ✓ Desbloqueada
                                </div>
                                {achievement.unlockedAt && (
                                  <div className="text-xs text-gray-500">
                                    {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-600">
                                🔒 Bloqueada
                              </div>
                            )}
                          </div>

                          {/* Progresso (se bloqueada) */}
                          {!achievement.isUnlocked && achievement.progress > 0 && (
                            <div className="mt-3">
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 transition-all"
                                  style={{ width: `${achievement.progress}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 text-center mt-1">
                                {Math.round(achievement.progress)}% concluído
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
