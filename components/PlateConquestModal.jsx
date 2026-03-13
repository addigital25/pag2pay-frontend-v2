import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function PlateConquestModal({ achievement, onClose }) {
  const [showContent, setShowContent] = useState(false);
  const [achievementsLogo, setAchievementsLogo] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const modalContentRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    // Buscar logo das premiações das configurações da plataforma
    fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings')
      .then(res => res.json())
      .then(data => {
        if (data.images?.achievementsLogoUrl) {
          setAchievementsLogo(data.images.achievementsLogoUrl);
        }
      })
      .catch(err => console.error('Erro ao buscar logo das premiações:', err));

    // Mostrar conteúdo após um pequeno delay
    setTimeout(() => setShowContent(true), 100);
  }, []);

  const primaryColor = achievement.primaryColor || '#FFD700';
  const secondaryColor = achievement.secondaryColor || '#FFA500';

  // Função para gerar e baixar a imagem do modal
  const handleShare = async () => {
    try {
      setIsGeneratingImage(true);

      // Esconder botões e botão X temporariamente
      if (buttonsRef.current) {
        buttonsRef.current.style.display = 'none';
      }
      const closeButton = document.querySelector('#close-button-modal');
      if (closeButton) {
        closeButton.style.display = 'none';
      }

      // Aguardar um frame para garantir que os botões foram escondidos
      await new Promise(resolve => setTimeout(resolve, 50));

      // Capturar o modal
      const canvas = await html2canvas(modalContentRef.current, {
        backgroundColor: null,
        scale: 2, // Maior qualidade
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      // Mostrar botões novamente
      if (buttonsRef.current) {
        buttonsRef.current.style.display = 'block';
      }
      if (closeButton) {
        closeButton.style.display = 'flex';
      }

      // Converter canvas para blob
      canvas.toBlob((blob) => {
        // Criar URL do blob
        const url = URL.createObjectURL(blob);

        // Criar link de download
        const link = document.createElement('a');
        const fileName = `conquista-${achievement.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        link.download = fileName;
        link.href = url;
        link.click();

        // Limpar URL
        URL.revokeObjectURL(url);

        setIsGeneratingImage(false);
      }, 'image/png');

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      setIsGeneratingImage(false);

      // Garantir que os botões voltam a aparecer em caso de erro
      if (buttonsRef.current) {
        buttonsRef.current.style.display = 'block';
      }
      const closeButton = document.querySelector('#close-button-modal');
      if (closeButton) {
        closeButton.style.display = 'flex';
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'fadeInOverlay 0.3s ease-out'
      }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '600px',
          width: '100%',
          background: 'linear-gradient(135deg, #16213e 0%, #0f1419 100%)',
          borderRadius: '24px',
          padding: '50px 40px',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          animation: showContent ? 'scaleIn 0.4s ease-out' : 'none',
          transform: showContent ? 'scale(1)' : 'scale(0.9)',
          opacity: showContent ? 1 : 0
        }}
      >
        {/* Botão Fechar (X) */}
        <button
          id="close-button-modal"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ✕
        </button>

        {/* Logo das Premiações (se existir) */}
        {achievementsLogo && (
          <div style={{ marginBottom: '30px' }}>
            <img
              src={achievementsLogo}
              alt="Logo Premiações"
              style={{
                maxWidth: '180px',
                maxHeight: '60px',
                objectFit: 'contain',
                opacity: 0.9
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Texto "AGORA VOCÊ É" */}
        <p
          style={{
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '30px'
          }}
        >
          AGORA VOCÊ É
        </p>

        {/* Badge Icon */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          {/* Glow behind badge */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '150px',
              background: `radial-gradient(circle, ${primaryColor}40, transparent)`,
              filter: 'blur(20px)',
              pointerEvents: 'none'
            }}
          />

          {/* Badge circle */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              fontSize: '80px',
              animation: 'gentleRotate 4s ease-in-out infinite'
            }}
          >
            {achievement.icon}
          </div>
        </div>

        {/* Nome da Conquista */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: '900',
            lineHeight: '1',
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}
        >
          {achievement.name}
        </h1>

        {/* Subtítulo (se houver) */}
        {achievement.subtitle && (
          <p
            style={{
              fontSize: '24px',
              color: '#fff',
              fontWeight: '600',
              marginBottom: '30px'
            }}
          >
            {achievement.subtitle}
          </p>
        )}

        {/* 3 Boxes: Meta, Placa Física, Nível */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '30px',
            marginTop: '30px'
          }}
        >
          {/* Meta Atingida */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 12px',
              border: `1px solid ${primaryColor}30`
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: primaryColor,
                marginBottom: '4px'
              }}
            >
              {achievement.value || 'R$ 50.000'}
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Meta Atingida
            </div>
          </div>

          {/* Placa Física */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 12px',
              border: `1px solid ${primaryColor}30`
            }}
          >
            <div
              style={{
                fontSize: '32px',
                marginBottom: '4px'
              }}
            >
              🏆
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Placa Física
            </div>
          </div>

          {/* Nível */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 12px',
              border: `1px solid ${primaryColor}30`
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: primaryColor,
                marginBottom: '4px'
              }}
            >
              #{achievement.level || '1'}
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              Nível
            </div>
          </div>
        </div>

        {/* Descrição */}
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.6',
            marginBottom: '30px',
            maxWidth: '480px',
            margin: '0 auto 30px'
          }}
          dangerouslySetInnerHTML={{ __html: achievement.description }}
        />

        {/* Box de Benefícios */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            borderLeft: `4px solid ${primaryColor}`,
            padding: '20px 24px',
            marginBottom: '30px',
            textAlign: 'left'
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: primaryColor,
              marginBottom: '12px'
            }}
          >
            🏆 Benefícios desta Conquista:
          </h3>
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.8'
            }}
          >
            <p style={{ marginBottom: '8px' }}>• Placa física personalizada enviada gratuitamente</p>
            <p style={{ marginBottom: '8px' }}>• Selo especial no seu perfil</p>
            <p>• Destaque na lista de top performers</p>
          </div>
        </div>

        {/* Botões */}
        <div ref={buttonsRef}>
          {/* Botão Principal: Receber Minha Placa */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '18px 40px',
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: `0 8px 24px ${primaryColor}50`,
              marginBottom: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${primaryColor}60`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${primaryColor}50`;
            }}
          >
            📦 RECEBER MINHA PLACA
          </button>

          {/* Botão Secundário: Compartilhar */}
          <button
            onClick={handleShare}
            disabled={isGeneratingImage}
            style={{
              width: '100%',
              padding: '18px 40px',
              background: 'transparent',
              color: '#fff',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isGeneratingImage ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: isGeneratingImage ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!isGeneratingImage) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isGeneratingImage ? '⏳ GERANDO IMAGEM...' : '🔗 COMPARTILHAR'}
          </button>
        </div>

        {/* Data de Desbloqueio */}
        {achievement.unlockedAt && (
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
              marginTop: '16px'
            }}
          >
            Desbloqueada em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeInOverlay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes gentleRotate {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
      `}</style>
    </div>
  );
}
