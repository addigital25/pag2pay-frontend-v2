/**
 * Utilitários de Formatação
 * Funções para formatar CPF, CNPJ, telefone, CEP, etc.
 */

/**
 * Formata CPF: 000.000.000-00
 * @param {string} value - Valor a ser formatado
 * @returns {string} CPF formatado
 */
export const formatCPF = (value) => {
  if (!value) return '';

  return value
    .replace(/\D/g, '')
    .substring(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Remove formatação do CPF
 * @param {string} value - CPF formatado
 * @returns {string} Apenas números
 */
export const removeCPFFormat = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

/**
 * Formata CNPJ: 00.000.000/0000-00
 * @param {string} value - Valor a ser formatado
 * @returns {string} CNPJ formatado
 */
export const formatCNPJ = (value) => {
  if (!value) return '';

  return value
    .replace(/\D/g, '')
    .substring(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

/**
 * Formata Telefone: (00) 00000-0000
 * @param {string} value - Valor a ser formatado
 * @returns {string} Telefone formatado
 */
export const formatPhone = (value) => {
  if (!value) return '';

  return value
    .replace(/\D/g, '')
    .substring(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

/**
 * Formata CEP: 00000-000
 * @param {string} value - Valor a ser formatado
 * @returns {string} CEP formatado
 */
export const formatCEP = (value) => {
  if (!value) return '';

  return value
    .replace(/\D/g, '')
    .substring(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
};

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} true se válido
 */
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;

  if (digito1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;

  return digito2 === parseInt(cpf.charAt(10));
};

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} true se válido
 */
export const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/\D/g, '');

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
};
