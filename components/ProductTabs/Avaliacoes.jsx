export default function Avaliacoes({ product, setProduct }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Avaliações de Clientes</h2>
        <p className="text-sm text-gray-600 mb-6">Configure avaliações e comentários</p>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="rounded text-emerald-600" />
        <span className="font-medium">Habilitar avaliações de clientes</span>
      </label>
    </div>
  )
}
