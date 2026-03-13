import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import PlateConquestModal from '../components/PlateConquestModal';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [pendingModal, setPendingModal] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked, physical

  useEffect(() => {
    loadAchievements();
    checkPendingModals();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/achievements/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingModals = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`https://pag2pay-backend01-production.up.railway.app/api/achievements/user/${userId}`);

      if (response.ok) {
        const data = await response.json();
        // Buscar primeiro achievement com modal pendente
        const pending = data.find(a => a.hasSpecialModal && a.isUnlocked && !a.modalShown);
        if (pending) {
          setPendingModal(pending);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar modals pendentes:', error);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const unlocked = data.filter(a => a.isUnlocked).length;
    const locked = total - unlocked;
    const physical = data.filter(a => a.hasPhysicalReward && a.isUnlocked).length;

    setStats({
      total,
      unlocked,
      locked,
      physical,
      progress: total > 0 ? Math.round((unlocked / total) * 100) : 0
    });
  };

  const handleCloseModal = async (userAchievementId) => {
    try {
      // Marcar modal como exibido
      await fetch(`https://pag2pay-backend01-production.up.railway.app/api/achievements/mark-shown/${userAchievementId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPendingModal(null);
      loadAchievements(); // Recarregar para atualizar status
    } catch (error) {
      console.error('Erro ao fechar modal:', error);
    }
  };

  const getFilteredAchievements = () => {
    switch (filter) {
      case 'unlocked':
        return achievements.filter(a => a.isUnlocked);
      case 'locked':
        return achievements.filter(a => !a.isUnlocked);
      case 'physical':
        return achievements.filter(a => a.hasPhysicalReward);
      default:
        return achievements;
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      common: '#94a3b8',
      uncommon: '#10b981',
      rare: '#3b82f6',
      epic: '#a855f7',
      milestone: '#f59e0b',
      physical_reward: '#ef4444'
    };
    return colors[tier] || '#94a3b8';
  };

  const getTierGlow = (tier) => {
    const glows = {
      common: 'rgba(148, 163, 184, 0.3)',
      uncommon: 'rgba(16, 185, 129, 0.3)',
      rare: 'rgba(59, 130, 246, 0.3)',
      epic: 'rgba(168, 85, 247, 0.3)',
      milestone: 'rgba(245, 158, 11, 0.3)',
      physical_reward: 'rgba(239, 68, 68, 0.3)'
    };
    return glows[tier] || 'rgba(148, 163, 184, 0.3)';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          padding: '20px',
          borderRadius: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'spin 1s linear infinite'
            }}>⏳</div>
            <p>Carregando suas conquistas...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  return (
    <AdminLayout>
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        padding: '30px 20px',
        borderRadius: '12px',
        minHeight: '80vh'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#fff'
          }}>
            <h1 style={{
              fontSize: '40px',
              fontWeight: 'bold',
              marginBottom: '8px',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              🏆 Minhas Premiações
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>
              Acompanhe suas conquistas e desbloqueie recompensas exclusivas
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '4px' }}>
                  {stats.unlocked}/{stats.total}
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Conquistas</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {stats.progress}%
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Progresso</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
                  {stats.physical}
                </div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>Placas Físicas</div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '24px',
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            {[
              { value: 'all', label: 'Todas', icon: '🎯' },
              { value: 'unlocked', label: 'Desbloqueadas', icon: '✅' },
              { value: 'locked', label: 'Bloqueadas', icon: '🔒' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: filter === f.value ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' : '#f1f5f9',
                  color: filter === f.value ? '#fff' : '#64748b',
                  fontWeight: filter === f.value ? 'bold' : 'normal',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '13px'
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Grid de Conquistas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px'
          }}>
            {filteredAchievements.map(achievement => (
              <div
                key={achievement.id}
                onClick={() => achievement.isUnlocked && setSelectedAchievement(achievement)}
                style={{
                  background: achievement.isUnlocked
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: achievement.isUnlocked ? 'pointer' : 'default',
                  transition: 'all 0.3s',
                  border: `2px solid ${achievement.isUnlocked ? getTierColor(achievement.tier) : '#e2e8f0'}`,
                  boxShadow: achievement.isUnlocked
                    ? `0 8px 30px ${getTierGlow(achievement.tier)}`
                    : '0 2px 10px rgba(0,0,0,0.1)',
                  position: 'relative',
                  filter: achievement.isUnlocked ? 'none' : 'grayscale(100%)',
                  opacity: achievement.isUnlocked ? 1 : 0.7
                }}
                onMouseEnter={(e) => {
                  if (achievement.isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${getTierGlow(achievement.tier)}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (achievement.isUnlocked) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 30px ${getTierGlow(achievement.tier)}`;
                  }
                }}
              >
                {/* Badge de Placa Física */}
                {achievement.hasPhysicalReward && achievement.isUnlocked && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)'
                  }}>
                    🎁 PLACA FÍSICA
                  </div>
                )}

                {/* Ícone */}
                <div style={{
                  fontSize: '56px',
                  marginBottom: '12px',
                  filter: achievement.isUnlocked ? 'none' : 'grayscale(100%)'
                }}>
                  {achievement.icon}
                </div>

                {/* Nome */}
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  color: achievement.isUnlocked ? '#1e293b' : '#94a3b8'
                }}>
                  {achievement.name}
                </h3>

                {/* Descrição */}
                <p
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}
                  dangerouslySetInnerHTML={{ __html: achievement.description }}
                />

                {/* Status */}
                {achievement.isUnlocked ? (
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: `linear-gradient(135deg, ${getTierColor(achievement.tier)}, ${getTierColor(achievement.tier)}dd)`,
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ✓ Desbloqueada
                  </div>
                ) : (
                  <div style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    🔒 Bloqueada
                  </div>
                )}

                {/* Progress (se locked) */}
                {!achievement.isUnlocked && achievement.progress > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#e2e8f0',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${achievement.progress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      {Math.round(achievement.progress)}% concluído
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
              <p style={{ fontSize: '18px', color: '#64748b' }}>
                Nenhuma conquista encontrada com este filtro.
              </p>
            </div>
          )}
        </div>

        {/* Modal de Placa de Conquista */}
        {pendingModal && (
          <PlateConquestModal
            achievement={pendingModal}
            onClose={() => handleCloseModal(pendingModal.userAchievementId)}
          />
        )}

        {/* Modal de Detalhes */}
        {selectedAchievement && !selectedAchievement.hasSpecialModal && (
          <div
            onClick={() => setSelectedAchievement(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#fff',
                borderRadius: '24px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ fontSize: '96px', marginBottom: '20px' }}>
                {selectedAchievement.icon}
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: '#1e293b' }}>
                {selectedAchievement.name}
              </h2>
              <p
                style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: selectedAchievement.description }}
              />
              {selectedAchievement.unlockedAt && (
                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
                  Desbloqueada em: {new Date(selectedAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                </p>
              )}
              <button
                onClick={() => setSelectedAchievement(null)}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        </div>
    </AdminLayout>
  );
}
