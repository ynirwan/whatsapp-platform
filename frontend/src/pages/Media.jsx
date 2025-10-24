import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tantml:react-query'
import { mediaApi } from '../api/mediaApi'
import { useAccountStore } from '../store/accountStore'
import toast from 'react-hot-toast'
import { Image, Video, FileText, Trash2, Download, Upload } from 'lucide-react'
import Button from '../components/common/Button'
import FileUpload from '../components/common/FileUpload'
import Loader from '../components/common/Loader'

const Media = () => {
  const queryClient = useQueryClient()
  const { selectedAccount } = useAccountStore()
  const [selectedType, setSelectedType] = useState('all')

  if (!selectedAccount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Upload className="h-24 w-24 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No WhatsApp Account Selected</h3>
        <p className="text-gray-600">Please select a WhatsApp account to upload media</p>
      </div>
    )
  }

  // Fetch media
  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: () => mediaApi.getMedia()
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file) => mediaApi.uploadMedia(file, selectedAccount.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['media'])
      toast.success('File uploaded successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Upload failed')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => mediaApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['media'])
      toast.success('File deleted')
    }
  })

  const handleUpload = async (file) => {
    await uploadMutation.mutateAsync(file)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading media..." />
      </div>
    )
  }

  const mediaItems = mediaData?.data?.data?.rows || []

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="h-6 w-6 text-blue-600" />
    if (mimeType.startsWith('video/')) return <Video className="h-6 w-6 text-purple-600" />
    return <FileText className="h-6 w-6 text-gray-600" />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-2">Upload and manage media files for messages</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New File</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {/* Filter */}
      <div className="flex space-x-2 mb-6">
        {['all', 'image', 'video', 'document'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedType === type
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaItems.map((media) => (
            <div key={media.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              {media.mimeType.startsWith('image/') ? (
                <img
                  src={media.url}
                  alt={media.filename}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  {getFileIcon(media.mimeType)}
                </div>
              )}
              
              <div className="p-4">
                <p className="text-sm font-medium text-gray-900 truncate">{media.filename}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(media.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => window.open(media.url, '_blank')}
                    className="flex-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Download className="h-3 w-3 inline mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this file?')) {
                        deleteMutation.mutate(media.id)
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    <Trash2 className="h-3 w-3 inline" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Upload className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Media Files Yet</h3>
          <p className="text-gray-600">Upload your first file to get started</p>
        </div>
      )}
    </div>
  )
}

export default Media
