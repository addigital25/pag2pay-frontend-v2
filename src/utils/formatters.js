import { formatCPF, validateCPF } from '../utils/formatters'

const handleCPFBlur = (e) => {
  const formatted = formatCPF(e.target.value)
  setCpf(formatted)

  // Validar se CPF é válido
  if (formatted && !validateCPF(formatted)) {
    alert('CPF inválido!')
  }
}

<input
  name="cpf"
  value={cpf}
  onChange={(e) => setCpf(e.target.value)}
  onBlur={handleCPFBlur}
/>
