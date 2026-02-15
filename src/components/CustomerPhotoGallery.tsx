'use client'

import { useState } from 'react'
import { Camera, Calendar } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumbnail: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
  category: 'before' | 'progress' | 'after' | 'completion'
  description?: string
  location?: string
}

interface CustomerPhotoGalleryProps {
  jobId: string
}

// Mock customer-friendly photos (filtered from internal gallery)
const mockCustomerPhotos: Photo[] = [
  {
    id: '1',
    url: '/photos/job1-1.jpg',
    thumbnail: '/photos/job1-1-thumb.jpg',
    fileName: 'electrical-panel-before.jpg',
    uploadedAt: '2026-02-15T08:30:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'before',
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
    description: 'New GFCI outlets installed near prep area',
    location: 'Kitchen - Prep Area',
  },
  // Note: "issue" photos are filtered out for customer view
  {
    id: '4',
    url: '/photos/job1-4.jpg',
    thumbnail: '/photos/job1-4-thumb.jpg',
    fileName: 'panel-complete.jpg',
    uploadedAt: '2026-02-14T17:30:00Z',
    uploadedBy: 'Mike Johnson',
    category: 'completion',
    description: 'New electrical panel installation completed',
    location: 'Kitchen - Main Panel',
  },
]

const categoryLabels = {
  'before': 'Before Work',
  'progress': 'Progress Update',
  'after': 'After Work',
  'completion': 'Completed Work',
}

const categoryColors = {
  'before': 'bg-gray-100 text-gray-800',
  'progress': 'bg-blue-100 text-blue-800',
  'after': 'bg-green-100 text-green-800',
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

const formatDateFull = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CustomerPhotoGallery({ jobId }: CustomerPhotoGalleryProps) {
  const [photos] = useState<Photo[]>(mockCustomerPhotos)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  // Filter photos by category
  const filteredPhotos = photos.filter(photo => 
    selectedCategory === 'all' || photo.category === selectedCategory
  )

  // Group photos by date for timeline view
  const photosByDate = filteredPhotos.reduce((groups, photo) => {
    const date = new Date(photo.uploadedAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(photo)
    return groups
  }, {} as Record<string, Photo[]>)

  const sortedDates = Object.keys(photosByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  if (photos.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h5 className="font-medium text-gray-900 mb-2">No Photos Yet</h5>
        <p className="text-gray-600 text-sm">
          Photos will appear here as work progresses on your project.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Camera className="h-5 w-5 text-gray-400 mr-2" />
          <h4 className="text-lg font-medium text-gray-900">Project Photos</h4>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {filteredPhotos.length} photos
          </span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">All Photos</option>
          <option value="before">Before Work</option>
          <option value="progress">Progress Updates</option>
          <option value="after">After Work</option>
          <option value="completion">Completed Work</option>
        </select>
      </div>

      {/* Timeline View */}
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="flex items-center mb-4">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <h5 className="text-sm font-medium text-gray-900">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </h5>
              <span className="ml-2 text-sm text-gray-500">
                {photosByDate[date].length} photo{photosByDate[date].length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photosByDate[date].map((photo) => (
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[photo.category]}`}>
                      {categoryLabels[photo.category]}
                    </span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate">{photo.description || 'Project photo'}</p>
                    <p className="text-xs text-gray-300">{formatDate(photo.uploadedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && selectedCategory !== 'all' && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h5 className="font-medium text-gray-900 mb-2">No {categoryLabels[selectedCategory as keyof typeof categoryLabels]} Photos</h5>
          <p className="text-gray-600 text-sm">
            Try selecting "All Photos" to see all available images.
          </p>
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedPhoto.description || 'Project Photo'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDateFull(selectedPhoto.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedPhoto.category]}`}>
                    {categoryLabels[selectedPhoto.category]}
                  </span>
                  <button 
                    onClick={() => setSelectedPhoto(null)}
                    className="text-gray-400 hover:text-gray-500 text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <Camera className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Category</p>
                  <p className="text-gray-600">{categoryLabels[selectedPhoto.category]}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{selectedPhoto.location || 'Project site'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}