import { useState, useRef } from 'react'
import { Upload, X, File, Image, Video, FileText } from 'lucide-react'
import Button from './Button'

const FileUpload = ({ onUpload, acceptedTypes = 'image/*,video/*,application/pdf', maxSize = 16 }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    setSelectedFile(file)

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreview(null)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!selectedFile) return <File className="h-8 w-8" />
    
    if (selectedFile.type.startsWith('image/')) return <Image className="h-8 w-8" />
    if (selectedFile.type.startsWith('video/')) return <Video className="h-8 w-8" />
    return <FileText className="h-8 w-8" />
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors"
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">Max file size: {maxSize}MB</p>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg mb-4" />
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg mb-4">
              {getFileIcon()}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  setPreview(null)
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            loading={uploading}
            className="w-full mt-4"
          >
            Upload File
          </Button>
        </div>
      )}
    </div>
  )
}

export default FileUpload
