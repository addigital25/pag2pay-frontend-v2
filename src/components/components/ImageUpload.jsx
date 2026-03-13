import { useState, useEffect } from 'react'
import AlertModal from './AlertModal'
import { useAlert } from '../hooks/useAlert'

// Helper para validar se tem imagem válida
const hasValidImage = (value) => {
  if (!value) return false
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  // Verificar se é base64 ou URL válida
  return trimmed.startsWith('data:image/') || trimmed.startsWith('http')
}

function ImageUpload({ value, onChange, label = "Imagem do Produto", hasError = false }) {
  const { alertState, showAlert, hideAlert } = useAlert()
  const [preview, setPreview] = useState(hasValidImage(value) ? value : '')
  const [isDragging, setIsDragging] = useState(false)

  // Atualizar preview quando value mudar de fora
  useEffect(() => {
    setPreview(hasValidImage(value) ? value : '')
  }, [value])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      showAlert({
        title: 'Arquivo inválido',
        message: 'Por favor, selecione apenas arquivos de imagem',
        type: 'warning'
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      setPreview(base64String)
      onChange(base64String)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} <span className="text-red-500">*</span>
        </label>

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            hasError
              ? 'border-red-500 bg-red-50'
              : isDragging
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Escolher Arquivo
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            ou arraste e solte uma imagem aqui
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, GIF até 10MB
          </p>
        </div>
      )}

      {/* Aviso de tamanho recomendado */}
      <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Tamanho recomendado: 500x400 pixels para melhor visualização
      </p>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        buttonText={alertState.buttonText}
      />
    </>
  )
}

export default ImageUpload
