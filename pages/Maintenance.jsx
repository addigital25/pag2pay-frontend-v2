export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ícone Animado */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {/* Círculos animados */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-pulse"></div>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-5xl font-bold text-white mb-4">
          Estamos em Manutenção
        </h1>

        {/* Subtítulo */}
        <p className="text-xl text-slate-300 mb-8">
          Estamos realizando melhorias no sistema para oferecer uma experiência ainda melhor.
        </p>

        {/* Detalhes */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-8">
          <div className="space-y-4 text-slate-200">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg">Tempo estimado: Em breve</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg">Melhorias e otimizações em andamento</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-lg">Seus dados estão seguros</span>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="text-slate-400 text-sm space-y-2">
          <p>Caso tenha alguma urgência, entre em contato:</p>
          <div className="flex justify-center gap-6 mt-4">
            <a
              href="mailto:suporte@plataforma.com"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              suporte@plataforma.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            © 2026 Pag2Pay. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
