import AdminLayout from '../components/AdminLayout'

export default function UserTerms() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📜 Termos de Uso
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <div className="prose prose-emerald max-w-none space-y-6">
            {/* Section 1 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Aceite dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao acessar e usar a plataforma Pag2Pay ("Plataforma"), você concorda com estes Termos de Uso.
              Se você não concorda com qualquer parte destes termos, não deve usar a Plataforma.
            </p>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. Descrição do Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A Pag2Pay é uma plataforma que conecta produtores, afiliados e compradores, permitindo:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Produtores cadastrarem e venderem produtos digitais ou físicos</li>
              <li>Afiliados promoverem produtos e receberem comissões</li>
              <li>Compradores adquirirem produtos com opção "Receba e Pague"</li>
              <li>Processamento de pagamentos e gestão financeira</li>
            </ul>

            {/* Section 3 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Cadastro e Conta
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para usar a Plataforma, você deve:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              <li>Manter a confidencialidade de sua senha</li>
              <li>Ter no mínimo 18 anos de idade</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
            </ul>

            {/* Section 4 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Responsabilidades do Produtor
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao cadastrar produtos, o produtor se compromete a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Garantir que possui direitos autorais sobre os produtos</li>
              <li>Fornecer descrições precisas e completas</li>
              <li>Cumprir prazos de entrega prometidos</li>
              <li>Oferecer suporte adequado aos compradores</li>
              <li>Honrar garantias de reembolso conforme legislação</li>
            </ul>

            {/* Section 5 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Responsabilidades do Afiliado
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Os afiliados devem:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Promover produtos de forma ética e legal</li>
              <li>Não fazer promessas falsas ou enganosas</li>
              <li>Respeitar direitos autorais em materiais de divulgação</li>
              <li>Não usar spam ou práticas abusivas de marketing</li>
            </ul>

            {/* Section 6 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. Pagamentos e Comissões
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A Plataforma cobra taxas sobre transações conforme tabela disponível no site.
              Produtores e afiliados receberão pagamentos conforme cronograma estabelecido,
              após dedução de taxas e impostos aplicáveis.
            </p>

            {/* Section 7 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. Política de Reembolso
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Compradores têm direito a reembolso conforme Código de Defesa do Consumidor:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>7 dias para produtos digitais (direito de arrependimento)</li>
              <li>Conforme garantia do produto para defeitos ou não-conformidade</li>
              <li>Reembolsos processados em até 10 dias úteis</li>
            </ul>

            {/* Section 8 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. Propriedade Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todo conteúdo da Plataforma (textos, gráficos, logos, código) é propriedade da Pag2Pay
              ou de seus licenciadores, protegido por leis de direitos autorais.
            </p>

            {/* Section 9 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              9. Proibições
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              É expressamente proibido:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Usar a Plataforma para atividades ilegais</li>
              <li>Vender produtos falsificados ou roubados</li>
              <li>Realizar fraudes ou tentativas de fraude</li>
              <li>Violar direitos de terceiros</li>
              <li>Tentar hackear ou comprometer a segurança da Plataforma</li>
            </ul>

            {/* Section 10 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              10. Limitação de Responsabilidade
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A Pag2Pay atua como intermediadora e não se responsabiliza por:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Qualidade, legalidade ou adequação dos produtos vendidos</li>
              <li>Disputas entre produtores e compradores</li>
              <li>Lucros cessantes ou danos indiretos</li>
              <li>Falhas técnicas ou indisponibilidade temporária</li>
            </ul>

            {/* Section 11 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              11. Modificações dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Podemos alterar estes Termos a qualquer momento. Alterações significativas serão
              notificadas por e-mail. O uso continuado da Plataforma após mudanças constitui aceite.
            </p>

            {/* Section 12 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              12. Lei Aplicável
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida
              no foro da comarca de [Cidade], com exclusão de qualquer outro.
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
