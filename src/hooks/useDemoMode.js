import { useState, useEffect } from 'react';

/**
 * Hook para verificar se o usuário atual está em modo demonstração
 * @returns {boolean} true se o usuário está em modo demo
 */
export function useDemoMode() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDemoMode = async () => {
      try {
        // Pegar usuário logado
        const userStr = localStorage.getItem('user_user');
        if (!userStr) {
          setIsDemoMode(false);
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        if (!user || !user.email) {
          setIsDemoMode(false);
          setLoading(false);
          return;
        }

        // Buscar configurações da plataforma
        const response = await fetch('https://pag2pay-backend01-production.up.railway.app/api/platform/settings');

        if (!response.ok) {
          setIsDemoMode(false);
          setLoading(false);
          return;
        }

        const settings = await response.json();

        // Verificar se o email do usuário está na lista de demo mode
        const demoUsers = settings.extras?.demoModeUsers || [];
        const isInDemoMode = demoUsers.includes(user.email);

        setIsDemoMode(isInDemoMode);
        setLoading(false);

      } catch (error) {
        console.error('Erro ao verificar modo demo:', error);
        setIsDemoMode(false);
        setLoading(false);
      }
    };

    checkDemoMode();
  }, []);

  return { isDemoMode, loading };
}

export default useDemoMode;
