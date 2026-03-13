import AdminLayout from '../components/AdminLayout'

export default function UserPrivacy() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Política de Privacidade
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="prose prose-emerald max-w-none space-y-6">
            {/* Section 1 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Introdução
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta Política de Privacidade descreve como a Pag2Pay ("nós", "nosso") coleta,
              usa, armazena e protege seus dados pessoais, em conformidade com a Lei Geral
              de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. Dados Coletados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Coletamos as seguintes categorias de dados:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.1. Dados de Cadastro
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Nome completo</li>
              <li>CPF/CNPJ</li>
              <li>Data de nascimento</li>
              <li>E-mail</li>
              <li>Telefone</li>
              <li>Endereço completo</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.2. Dados Financeiros
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Dados bancários (banco, agência, conta)</li>
              <li>Chave PIX</li>
              <li>Histórico de transações</li>
              <li>Informações de pagamento (processadas por gateways seguros)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.3. Documentos de Identificação
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>RG, CNH ou RNE (frente e verso)</li>
              <li>Selfie com documento</li>
              <li>Comprovante de endereço</li>
              <li>Contrato social (para PJ)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.4. Dados de Uso
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Endereço IP</li>
              <li>Tipo de navegador</li>
              <li>Páginas visitadas</li>
              <li>Tempo de permanência</li>
              <li>Cookies e tecnologias similares</li>
            </ul>

            {/* Section 3 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Finalidade do Tratamento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos seus dados pessoais para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Criar e gerenciar sua conta</li>
              <li>Processar transações e pagamentos</li>
              <li>Verificar identidade e prevenir fraudes (KYC/AML)</li>
              <li>Cumprir obrigações legais e regulatórias</li>
              <li>Enviar comunicações sobre sua conta e transações</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Marketing (com seu consentimento)</li>
            </ul>

            {/* Section 4 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Base Legal do Tratamento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Tratamos seus dados com base em:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Execução de contrato:</strong> Dados necessários para prestar o serviço</li>
              <li><strong>Obrigação legal:</strong> Cumprimento de leis fiscais, AML, etc.</li>
              <li><strong>Legítimo interesse:</strong> Prevenção de fraudes, segurança</li>
              <li><strong>Consentimento:</strong> Marketing e cookies não essenciais</li>
            </ul>

            {/* Section 5 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Compartilhamento de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos compartilhar seus dados com:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Gateways de pagamento:</strong> Para processar transações</li>
              <li><strong>Bancos:</strong> Para transferências e saques</li>
              <li><strong>Autoridades:</strong> Quando exigido por lei</li>
              <li><strong>Prestadores de serviço:</strong> Hospedagem, analytics, suporte</li>
              <li><strong>Parceiros:</strong> Com consentimento explícito</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Não vendemos seus dados pessoais a terceiros.</strong>
            </p>

            {/* Section 6 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. Armazenamento e Segurança
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Implementamos medidas de segurança técnicas e organizacionais:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Criptografia de dados em trânsito (SSL/TLS)</li>
              <li>Criptografia de dados sensíveis em repouso</li>
              <li>Controles de acesso e autenticação</li>
              <li>Monitoramento de segurança 24/7</li>
              <li>Backups regulares</li>
              <li>Testes de segurança periódicos</li>
            </ul>

            {/* Section 7 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. Retenção de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Mantemos seus dados pelo tempo necessário para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Prestar o serviço contratado</li>
              <li>Cumprir obrigações legais (até 5 anos conforme legislação fiscal)</li>
              <li>Exercer direitos em processos judiciais</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Após este período, os dados são anonimizados ou excluídos.
            </p>

            {/* Section 8 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. Seus Direitos (LGPD)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você tem direito a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
              <li><strong>Acesso:</strong> Obter cópia dos seus dados</li>
              <li><strong>Correção:</strong> Atualizar dados incompletos ou incorretos</li>
              <li><strong>Anonimização/Bloqueio:</strong> Solicitar anonimização ou bloqueio</li>
              <li><strong>Eliminação:</strong> Excluir dados desnecessários</li>
              <li><strong>Portabilidade:</strong> Receber dados em formato estruturado</li>
              <li><strong>Revogação de consentimento:</strong> Retirar consentimento dado</li>
              <li><strong>Oposição:</strong> Opor-se a tratamentos</li>
            </ul>

            {/* Section 9 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              9. Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Utilizamos cookies para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li><strong>Essenciais:</strong> Funcionamento básico do site</li>
              <li><strong>Funcionalidade:</strong> Lembrar preferências</li>
              <li><strong>Analytics:</strong> Entender como você usa o site</li>
              <li><strong>Marketing:</strong> Personalizar anúncios (com consentimento)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Você pode gerenciar cookies nas configurações do navegador.
            </p>

            {/* Section 10 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              10. Transferência Internacional
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Alguns de nossos prestadores de serviço podem estar localizados fora do Brasil.
              Garantimos que tais transferências ocorrem com salvaguardas adequadas conforme LGPD.
            </p>

            {/* Section 11 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              11. Alterações nesta Política
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos atualizar esta política periodicamente. Mudanças significativas serão
              notificadas por e-mail ou aviso destacado na Plataforma.
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => window.location.href = '/documents'}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Documentos
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
