import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi'
import { validateFileType, validateFileSize } from '../../utils/validation'
import { MAX_FILE_SIZE_MB } from '../../utils/constants'

export default function Step3IDUpload({ data, onChange, onNext, onBack }) {
  const [file, setFile] = useState(data.idProofFile || null)
  const [preview, setPreview] = useState(data.idProofPreview || null)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('')
    if (rejectedFiles.length > 0) {
      setError('File rejected. Only JPG, PNG, PDF allowed, max 5MB.')
      return
    }
    const f = acceptedFiles[0]
    if (!validateFileType(f)) { setError('Only JPG, PNG, PDF allowed'); return }
    if (!validateFileSize(f, MAX_FILE_SIZE_MB)) { setError(`File too large. Max ${MAX_FILE_SIZE_MB}MB`); return }

    setFile(f)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    multiple: false,
  })

  function clearFile() {
    setFile(null)
    setPreview(null)
    setError('')
  }

  function handleNext() {
    if (!file) { setError('Please upload your ID proof'); return }
    onChange({ idProofFile: file, idProofPreview: preview })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-primary-dark font-bold mb-1">ID Proof Upload</h2>
        <p className="text-gray-500 font-body text-sm">Required for guest verification. Your data is stored securely.</p>
      </div>

      {/* Info banner */}
      <div className="bg-sky-godavari border border-river/20 rounded-xl p-4 font-body text-sm text-primary">
        <p className="font-semibold mb-1">Accepted documents:</p>
        <p className="text-gray-600">Aadhaar Card, PAN Card, Passport, Voter ID, Driving License</p>
        <p className="text-gray-500 mt-1 text-xs">Formats: JPG, PNG, PDF · Max size: {MAX_FILE_SIZE_MB}MB · Must be clear and readable</p>
      </div>

      {/* Drop zone */}
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-primary bg-sky-godavari scale-[1.02]'
              : 'border-gray-300 hover:border-river hover:bg-sky-dawn'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-river flex items-center justify-center">
              <FiUpload className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="font-body font-semibold text-primary-dark">
                {isDragActive ? 'Drop it here!' : 'Drag & drop your ID proof'}
              </p>
              <p className="text-gray-400 text-sm font-body mt-1">or click to browse files</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-300 bg-green-50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            {preview ? (
              <img src={preview} alt="ID preview" className="w-24 h-20 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" />
            ) : (
              <div className="w-24 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <FiFile className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FiCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="font-body font-semibold text-green-700 text-sm truncate">{file.name}</p>
              </div>
              <p className="text-gray-500 text-xs font-body">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}</p>
              <p className="text-green-600 text-xs font-body mt-1 font-medium">Ready to upload</p>
            </div>
            <button onClick={clearFile} className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-gray-400 hover:text-red-500 shrink-0">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg font-body text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Privacy note */}
      <p className="text-xs text-gray-400 font-body text-center">
        🔒 Your ID is encrypted and stored securely. Only accessible by MANNAT staff for verification.
      </p>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex-1">← Back</button>
        <button onClick={handleNext} className="btn-primary flex-[2]">Continue to Review →</button>
      </div>
    </div>
  )
}
