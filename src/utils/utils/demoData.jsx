// Gerador de Dados Fictícios para Modo Demonstração

const NAMES = [
  'João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Souza',
  'Juliana Lima', 'Fernando Alves', 'Patricia Rocha', 'Ricardo Martins', 'Camila Ferreira',
  'Lucas Barbosa', 'Amanda Ribeiro', 'Gabriel Carvalho', 'Fernanda Dias', 'Rafael Gomes',
  'Mariana Pinto', 'Thiago Moreira', 'Beatriz Castro', 'Bruno Araujo', 'Larissa Freitas'
];

const PRODUCTS = [
  'Curso de Marketing Digital', 'E-book de Vendas', 'Consultoria Premium',
  'Workshop Online', 'Mentoria Executiva', 'Treinamento Completo',
  'Masterclass Avançada', 'Programa VIP', 'Aula Particular',
  'Certificação Profissional', 'Bootcamp Intensivo', 'Summit Digital'
];

const PAYMENT_METHODS = [
  { method: 'credit_card', label: 'Cartão de Crédito' },
  { method: 'pix', label: 'PIX' },
  { method: 'boleto', label: 'Boleto' }
];

const STATUSES = [
  { status: 'paid', label: 'Pago', color: 'green' },
  { status: 'pending', label: 'Pendente', color: 'yellow' },
  { status: 'processing', label: 'Processando', color: 'blue' }
];

// Gera nome aleatório
function randomName() {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
}

// Gera produto aleatório
function randomProduct() {
  return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
}

// Gera email baseado no nome
function generateEmail(name) {
  const username = name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.');
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'];
  return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

// Gera valor aleatório
function randomValue(min = 50, max = 1000) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Gera data aleatória nos últimos N dias
function randomDate(daysAgo = 30) {
  const now = new Date();
  const past = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
  return past.toISOString();
}

// Gera método de pagamento aleatório
function randomPaymentMethod() {
  return PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
}

// Gera status aleatório (mais peso para "paid")
function randomStatus() {
  const weights = [0.8, 0.15, 0.05]; // 80% paid, 15% pending, 5% processing
  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      return STATUSES[i];
    }
  }

  return STATUSES[0];
}

// ========================================
// GERADORES DE DADOS
// ========================================

// Gera vendas fictícias
export function generateDemoSales(count = 30) {
  const sales = [];

  for (let i = 0; i < count; i++) {
    const name = randomName();
    const product = randomProduct();
    const value = randomValue(50, 1000);
    const paymentMethod = randomPaymentMethod();
    const status = randomStatus();
    const date = randomDate(30);

    sales.push({
      id: `DEMO-${String(i + 1).padStart(4, '0')}`,
      customer: name,
      customerEmail: generateEmail(name),
      product: product,
      value: value,
      valueInCents: value * 100,
      paymentMethod: paymentMethod.method,
      paymentMethodLabel: paymentMethod.label,
      status: status.status,
      statusLabel: status.label,
      statusColor: status.color,
      date: date,
      createdAt: date,
      isDemo: true
    });
  }

  // Ordenar por data (mais recente primeiro)
  return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Gera saldo fictício
export function generateDemoBalance() {
  return {
    available: {
      total: randomValue(5000, 25000) * 100, // Em centavos
      pix: randomValue(2000, 8000) * 100,
      credit_card: randomValue(2000, 10000) * 100,
      boleto: randomValue(1000, 7000) * 100
    },
    pending: {
      total: randomValue(3000, 15000) * 100,
      pix: randomValue(1000, 5000) * 100,
      credit_card: randomValue(1500, 7000) * 100,
      boleto: randomValue(500, 3000) * 100
    },
    transferred: {
      total: randomValue(20000, 100000) * 100,
      count: randomValue(50, 200)
    },
    isDemo: true
  };
}

// Gera produtos fictícios
export function generateDemoProducts(count = 5) {
  const products = [];

  for (let i = 0; i < count; i++) {
    const name = randomProduct();
    const sales = randomValue(10, 200);
    const value = randomValue(97, 997);

    products.push({
      id: `DEMO-PROD-${String(i + 1).padStart(3, '0')}`,
      name: name,
      description: `Produto de demonstração: ${name}`,
      price: value,
      priceInCents: value * 100,
      sales: sales,
      revenue: sales * value,
      conversionRate: (Math.random() * 15 + 5).toFixed(1), // 5% a 20%
      views: randomValue(500, 5000),
      status: 'active',
      createdAt: randomDate(90),
      isDemo: true
    });
  }

  return products;
}

// Gera dados de gráfico (últimos 30 dias)
export function generateDemoChartData(days = 30) {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const baseValue = 1000 + (Math.random() * 500);
    const trend = (days - i) * 30; // Tendência crescente
    const noise = Math.random() * 400 - 200; // Variação aleatória

    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, Math.floor(baseValue + trend + noise)),
      sales: randomValue(5, 30),
      isDemo: true
    });
  }

  return data;
}

// Gera movimentações bancárias
export function generateDemoBankMovements(count = 20) {
  const movements = [];
  const types = [
    { type: 'transfer_in', label: 'Recebimento', sign: '+', color: 'green' },
    { type: 'transfer_out', label: 'Saque', sign: '-', color: 'red' },
    { type: 'fee', label: 'Taxa', sign: '-', color: 'orange' }
  ];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const value = randomValue(100, 5000);

    movements.push({
      id: `DEMO-MOV-${String(i + 1).padStart(4, '0')}`,
      type: type.type,
      typeLabel: type.label,
      sign: type.sign,
      color: type.color,
      value: value,
      valueInCents: value * 100,
      description: `${type.label} - Demonstração`,
      date: randomDate(60),
      isDemo: true
    });
  }

  return movements.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Gera dashboard resumo
export function generateDemoDashboard() {
  const salesThisMonth = randomValue(100, 500);
  const revenueThisMonth = randomValue(15000, 80000);

  return {
    balance: {
      available: randomValue(8000, 35000),
      pending: randomValue(4000, 18000),
      transferred: randomValue(50000, 250000)
    },
    sales: {
      today: randomValue(5, 25),
      thisWeek: randomValue(30, 150),
      thisMonth: salesThisMonth,
      total: randomValue(500, 3000)
    },
    revenue: {
      today: randomValue(500, 3000),
      thisWeek: randomValue(4000, 20000),
      thisMonth: revenueThisMonth,
      total: randomValue(100000, 800000)
    },
    products: {
      active: randomValue(3, 15),
      pending: randomValue(0, 3),
      total: randomValue(5, 20)
    },
    conversionRate: (Math.random() * 10 + 5).toFixed(1), // 5% a 15%
    avgTicket: Math.floor(revenueThisMonth / salesThisMonth),
    isDemo: true
  };
}

// Gera relatório AfterPay
export function generateDemoAfterPayReport() {
  return {
    totalSubscriptions: randomValue(50, 300),
    activeSubscriptions: randomValue(40, 250),
    canceledSubscriptions: randomValue(5, 30),
    churnRate: (Math.random() * 8 + 2).toFixed(1), // 2% a 10%
    mrr: randomValue(15000, 80000), // Monthly Recurring Revenue
    arr: randomValue(180000, 960000), // Annual Recurring Revenue
    avgLifetimeValue: randomValue(500, 3000),
    isDemo: true
  };
}

// Banner de modo demo
export function DemoBanner({ className = '' }) {
  return (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg flex items-center gap-3 ${className}`}>
      <span className="text-2xl">🎭</span>
      <div className="flex-1">
        <h4 className="font-bold text-sm">Modo Demonstração Ativo</h4>
        <p className="text-xs opacity-90">Os dados exibidos são fictícios e gerados automaticamente</p>
      </div>
    </div>
  );
}

// Badge DEMO
export function DemoBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded ${className}`}>
      🎭 DEMO
    </span>
  );
}

export default {
  generateDemoSales,
  generateDemoBalance,
  generateDemoProducts,
  generateDemoChartData,
  generateDemoBankMovements,
  generateDemoDashboard,
  generateDemoAfterPayReport,
  DemoBanner,
  DemoBadge
};
