import Logo from '../components/Logo'

export default function TermsOfUse() {
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
              📜 Termos de Uso
            </h1>
            <p className="text-gray-600">
              Última atualização: <strong>11 de março de 2026</strong>
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            {/* Section 1 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao acessar e usar a plataforma <strong>Pag2Pay</strong>, você concorda em cumprir e estar
              vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos,
              não deverá usar nossa plataforma.
            </p>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. Descrição do Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A <strong>Pag2Pay</strong> é uma plataforma de pagamentos e marketplace digital que permite:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Criação e venda de produtos digitais</li>
              <li>Processamento de pagamentos via PIX, Boleto e Cartão de Crédito</li>
              <li>Programa de afiliados para divulgação de produtos</li>
              <li>Gestão financeira e saques</li>
              <li>Sistema de comissões e splits de pagamento</li>
            </ul>

            {/* Section 3 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Cadastro e Conta de Usuário
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Para usar a plataforma, você deve:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Fornecer informações precisas, completas e atualizadas durante o cadastro</li>
              <li>Ser responsável pela segurança de sua senha e conta</li>
              <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
              <li>Ser maior de 18 anos ou ter autorização legal para contratar</li>
              <li>Não transferir sua conta para terceiros sem autorização</li>
            </ul>

            {/* Section 4 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Uso da Plataforma
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao usar a Pag2Pay, você concorda em:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Não violar leis, regulamentos ou direitos de terceiros</li>
              <li>Não realizar atividades fraudulentas ou ilegais</li>
              <li>Não vender produtos proibidos por lei ou que violem direitos autorais</li>
              <li>Não utilizar a plataforma para enviar spam ou conteúdo malicioso</li>
              <li>Manter a confidencialidade das informações de clientes</li>
            </ul>

            {/* Section 5 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Produtos e Vendas
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Como produtor, você é responsável por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Garantir a qualidade e entrega dos produtos vendidos</li>
              <li>Fornecer descrições precisas e honestas dos produtos</li>
              <li>Cumprir prazos de entrega estabelecidos</li>
              <li>Oferecer suporte adequado aos compradores</li>
              <li>Respeitar os direitos de propriedade intelectual</li>
            </ul>

            {/* Section 6 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              6. Comissões e Pagamentos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A Pag2Pay cobra uma taxa de serviço sobre cada transação. Os valores das comissões são:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Definidos de acordo com o método de pagamento utilizado</li>
              <li>Descontados automaticamente antes do repasse ao produtor</li>
              <li>Podem ser alterados mediante aviso prévio de 30 dias</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Os pagamentos aos produtores são processados de acordo com o cronograma de saques
              estabelecido pela plataforma, respeitando prazos de antifraude e análise de risco.
            </p>

            {/* Section 7 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              7. Política de Reembolso
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cada produto possui uma garantia definida pelo produtor (geralmente 7 dias).
              Durante este período, o comprador pode solicitar reembolso se:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>O produto não foi entregue</li>
              <li>O produto está em desacordo com a descrição</li>
              <li>Houver problemas técnicos que impeçam o acesso</li>
            </ul>

            {/* Section 8 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              8. Propriedade Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todo o conteúdo da plataforma Pag2Pay (design, código, marca, textos) é de propriedade
              exclusiva da Pag2Pay e protegido por leis de direitos autorais. É proibido:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Copiar, modificar ou distribuir o conteúdo da plataforma</li>
              <li>Realizar engenharia reversa ou extrair código-fonte</li>
              <li>Usar a marca Pag2Pay sem autorização prévia</li>
            </ul>

            {/* Section 9 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              9. Limitação de Responsabilidade
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              A Pag2Pay atua como intermediadora de pagamentos. Não nos responsabilizamos por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
              <li>Qualidade, entrega ou conteúdo dos produtos vendidos</li>
              <li>Disputas entre compradores e vendedores</li>
              <li>Perdas financeiras decorrentes de uso inadequado da plataforma</li>
              <li>Interrupções ou falhas técnicas temporárias</li>
            </ul>

            {/* Section 10 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              10. Modificações dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento.
              Alterações significativas serão comunicadas por e-mail com 30 dias de antecedência.
              O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
            </p>

            {/* Section 11 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              11. Lei Aplicável
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida
              no foro da comarca de [Cidade], com exclusão de qualquer outro.
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
