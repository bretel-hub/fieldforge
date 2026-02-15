'use client'

import { useState } from 'react'
import { Camera, Upload, Grid3X3, List, Calendar, Tag, Search, Filter } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnail: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
  category: 'before' | 'progress' | 'after' | 'issue' | 'completion'
  tags: string[]
  description?: string
  location?: string
}

interface PhotoGalleryProps {
  jobId: string
}

// Mock photo data
const mockPhotos: Photo[] = [
  {
    id: '1',
    url: '/photos/job1-1.jpg',
    thumbnail: '/photos/job1-1-thumb.jpg',
    fileName: 'electrical-panel-before.jpg',
    uploadedAt: '2026-02-15T08:30:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'before',
    tags: ['electrical', 'panel', 'kitchen'],
    description: 'Existing electrical panel before upgrade',
    location: 'Kitchen - Main Panel',
  },
  {
    id: '2',
    url: '/photos/job1-2.jpg',
    thumbnail: '/photos/job1-2-thumb.jpg',
    fileName: 'wiring-progress-1.jpg',
    uploadedAt: '2026-02-15T10:15:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'progress',
    tags: ['wiring', 'installation'],
    description: 'New conduit installation in progress',
    location: 'Kitchen - Ceiling',
  },
  {
    id: '3',
    url: '/photos/job1-3.jpg',
    thumbnail: '/photos/job1-3-thumb.jpg',
    fileName: 'outlet-installation.jpg',
    uploadedAt: '2026-02-15T14:45:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'progress',
    tags: ['outlets', 'kitchen', 'GFCI'],
    description: 'New GFCI outlets installed near prep area',
    location: 'Kitchen - Prep Area',
  },
  {
    id: '4',
    url: '/photos/job1-4.jpg',
    thumbnail: '/photos/job1-4-thumb.jpg',
    fileName: 'safety-issue.jpg',
    uploadedAt: '2026-02-14T16:20:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'issue',
    tags: ['safety', 'code-violation'],
    description: 'Found old wiring not up to code - needs replacement',
    location: 'Kitchen - Behind Stove',
  },
]

const categoryStyles = {
  'before': 'bg-blue-100 text-blue-800',
  'progress': 'bg-yellow-100 text-yellow-800',
  'after': 'bg-green-100 text-green-800',
  'issue': 'bg-red-100 text-red-800',
  'completion': 'bg-green-100 text-green-800',
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PhotoGallery({ jobId }: PhotoGalleryProps) {
  const [photos] = useState<Photo[]>(mockPhotos)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      photo.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // In real app, this would upload to cloud storage
    const files = event.target.files
    if (files) {
      console.log('Uploading files:', files)
      // Handle file upload logic here
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Camera className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Photo Documentation</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {filteredPhotos.length} photos
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-500'}`}
            >
              <List className="h-4 w-4" />
            </button>
            
            <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-500">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="before">Before</option>
              <option value="progress">Progress</option>
              <option value="after">After</option>
              <option value="issue">Issues</option>
              <option value="completion">Completion</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md border-gray-300 text-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Photo Display */}
      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-500" />
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryStyles[photo.category]}`}>
                    {photo.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate">{photo.description || photo.fileName}</p>
                  <p className="text-xs text-gray-300">{formatDate(photo.uploadedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {photo.description || photo.fileName}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryStyles[photo.category]}`}>
                      {photo.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{photo.uploadedBy}</span>
                    <span>{formatDate(photo.uploadedAt)}</span>
                    {photo.location && <span>{photo.location}</span>}
                  </div>
                  <div className="flex items-center mt-1 space-x-1">
                    {photo.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No photos found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your filters'
                : 'Upload your first photo to get started'}
            </p>
          </div>
        )}
      </div>
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedPhoto.description || selectedPhoto.fileName}
                </h3>
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Category</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryStyles[selectedPhoto.category]}`}>
                    {selectedPhoto.category}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Uploaded By</p>
                  <p className="text-gray-600">{selectedPhoto.uploadedBy}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p className="text-gray-600">{formatDate(selectedPhoto.uploadedAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{selectedPhoto.location || 'Not specified'}</p>
                </div>
              </div>
              
              {selectedPhoto.tags.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-900 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPhoto.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}