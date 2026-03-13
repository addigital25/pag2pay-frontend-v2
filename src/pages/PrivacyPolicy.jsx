import Logo from '../components/Logo'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Logo />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              🔒 Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Última atualização: <strong>11 de março de 2026</strong>
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {/* Section 1 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Introdução
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A <strong>Pag2Pay</strong> valoriza sua privacidade e está comprometida em proteger
              seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos,
              armazenamos e protegemos suas informações pessoais, em conformidade com a
              <strong> Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>.
            </p>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. Informações Coletadas
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              📋 Dados Pessoais Fornecidos por Você:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li><strong>Identificação:</strong> Nome completo, CPF/CNPJ, data de nascimento</li>
              <li><strong>Contato:</strong> E-mail, telefone, endereço</li>
              <li><strong>Dados Bancários:</strong> Banco, agência, conta para saques</li>
              <li><strong>Documentos:</strong> RG, CNH, comprovantes para verificação KYC</li>
              <li><strong>Informações Comerciais:</strong> Dados sobre produtos, vendas e transações</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              📊 Dados Coletados Automaticamente:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li><strong>Dados de Navegação:</strong> Endereço IP, navegador, sistema operacional</li>
              <li><strong>Cookies:</strong> Identificadores de sessão e preferências</li>
              <li><strong>Logs de Acesso:</strong> Data, hora e páginas visitadas</li>
              <li><strong>Dados de Uso:</strong> Interações com a plataforma, cliques e comportamento</li>
            </ul>

            {/* Section 3 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Como Usamos Suas Informações
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos suas informações para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>✅ Criar e gerenciar sua conta na plataforma</li>
              <li>✅ Processar pagamentos e transações financeiras</li>
              <li>✅ Verificar sua identidade (KYC) e prevenir fraudes</li>
              <li>✅ Enviar notificações sobre vendas, comissões e atualizações</li>
              <li>✅ Melhorar nossos serviços e experiência do usuário</li>
              <li>✅ Cumprir obrigações legais e regulatórias</li>
              <li>✅ Fornecer suporte técnico e atendimento ao cliente</li>
              <li>✅ Enviar comunicações de marketing (com seu consentimento)</li>
            </ul>

            {/* Section 4 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Compartilhamento de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartilhar suas informações com:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>
                <strong>Processadores de Pagamento:</strong> Pagar.me, Stripe e outras gateways
                para processar transações
              </li>
              <li>
                <strong>Autoridades Legais:</strong> Quando exigido por lei ou para proteger
                direitos legais
              </li>
              <li>
                <strong>Prestadores de Serviços:</strong> Empresas que nos auxiliam em serviços
                como hospedagem, análise de dados e e-mail marketing
              </li>
              <li>
                <strong>Compradores e Afiliados:</strong> Informações necessárias para completar
                transações (nome, e-mail)
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>⚠️ Importante:</strong> Nunca vendemos seus dados pessoais para terceiros.
            </p>

            {/* Section 5 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Segurança dos Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>🔐 Criptografia SSL/TLS para dados em trânsito</li>
              <li>🔐 Criptografia de dados sensíveis em repouso</li>
              <li>🔐 Controles de acesso rigorosos (autenticação e autorização)</li>
              <li>🔐 Monitoramento contínuo de segurança e logs de auditoria</li>
              <li>🔐 Backups regulares e planos de recuperação de desastres</li>
              <li>🔐 Testes de segurança e atualizações constantes</li>
            </ul>

            {/* Section 6 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. Cookies e Tecnologias Similares
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Manter sua sessão ativa e segura</li>
              <li>Lembrar suas preferências e configurações</li>
              <li>Analisar o desempenho da plataforma</li>
              <li>Personalizar conteúdo e anúncios</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você pode controlar o uso de cookies através das configurações do seu navegador,
              mas isso pode limitar algumas funcionalidades da plataforma.
            </p>

            {/* Section 7 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. Seus Direitos (LGPD)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              De acordo com a LGPD, você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>
                <strong>📋 Acesso:</strong> Solicitar cópia dos seus dados pessoais que possuímos
              </li>
              <li>
                <strong>✏️ Correção:</strong> Atualizar ou corrigir informações imprecisas
              </li>
              <li>
                <strong>🗑️ Exclusão:</strong> Solicitar a exclusão dos seus dados (sujeito a
                obrigações legais)
              </li>
              <li>
                <strong>📤 Portabilidade:</strong> Receber seus dados em formato estruturado
              </li>
              <li>
                <strong>🚫 Oposição:</strong> Opor-se ao tratamento de dados para certas finalidades
              </li>
              <li>
                <strong>⛔ Revogação:</strong> Revogar consentimento previamente concedido
              </li>
              <li>
                <strong>ℹ️ Informação:</strong> Ser informado sobre com quem compartilhamos seus dados
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para exercer seus direitos, entre em contato conosco através do e-mail:
              <strong> privacidade@pag2pay.com</strong>
            </p>

            {/* Section 8 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. Retenção de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantemos seus dados pessoais pelo tempo necessário para:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Cumprir a finalidade para a qual foram coletados</li>
              <li>Atender requisitos legais, fiscais e regulatórios (mínimo 5 anos)</li>
              <li>Resolver disputas e fazer cumprir acordos</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Após esse período, os dados são anonimizados ou excluídos de forma segura.
            </p>

            {/* Section 9 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              9. Transferência Internacional de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Alguns de nossos prestadores de serviços estão localizados fora do Brasil.
              Garantimos que qualquer transferência internacional de dados seja realizada
              com salvaguardas adequadas, conforme exigido pela LGPD.
            </p>

            {/* Section 10 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              10. Menores de Idade
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Nossa plataforma não é destinada a menores de 18 anos. Não coletamos
              intencionalmente informações de crianças ou adolescentes. Se tomarmos conhecimento
              de que coletamos dados de menores sem consentimento parental, tomaremos medidas
              para excluir essas informações.
            </p>

            {/* Section 11 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              11. Alterações nesta Política
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você
              sobre mudanças significativas por e-mail ou através de aviso na plataforma.
              A data da última atualização será sempre indicada no topo deste documento.
            </p>

          </div>

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => window.location.href = '/register'}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
