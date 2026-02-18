'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { PhotoCaptureComponent } from '@/components/PhotoCapture'
import { Camera, MapPin, Clock, User, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhotoCapture } from '@/lib/cameraService'

interface JobDetailPageProps {
  params: {
    id: string
  }
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [showCamera, setShowCamera] = useState(false)
  const [jobPhotos, setJobPhotos] = useState<PhotoCapture[]>([])

  // Mock job data - in real app this would come from API/database
  const job = {
    id: params.id,
    title: "HVAC System Maintenance",
    customer: "ABC Manufacturing",
    address: "123 Industrial Ave, Cityville, ST 12345",
    status: "in_progress" as const,
    technicianName: "John Smith",
    scheduledDate: "2026-02-17",
    description: "Annual HVAC system maintenance and inspection. Check filters, coils, and refrigerant levels.",
    tasks: [
      { id: 1, title: "Inspect air filters", completed: true },
      { id: 2, title: "Check refrigerant levels", completed: true },
      { id: 3, title: "Clean evaporator coils", completed: false },
      { id: 4, title: "Test thermostat calibration", completed: false },
      { id: 5, title: "Document system performance", completed: false }
    ]
  }

  const handlePhotoCapture = (photo: PhotoCapture) => {
    setJobPhotos(prev => [...prev, photo])
    console.log('Photo captured:', photo)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const completedTasks = job.tasks.filter(task => task.completed).length
  const totalTasks = job.tasks.length
  const progressPercentage = (completedTasks / totalTasks) * 100

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {job.customer}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.address}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(job.scheduledDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <Button onClick={() => setShowCamera(true)} className="bg-green-600 hover:bg-green-700">
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{job.description}</p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Progress Overview</h2>
            <span className="text-sm text-gray-600">
              {completedTasks} of {totalTasks} tasks completed
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-green-600 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-600">
            {progressPercentage === 100 ? 'All tasks completed!' : `${Math.round(progressPercentage)}% complete`}
          </p>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Tasks</h2>
          <div className="space-y-3">
            {job.tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <CheckCircle 
                  className={`h-5 w-5 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </span>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Photo
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Photos</h2>
            <span className="text-sm text-gray-600">
              {jobPhotos.length} photos
            </span>
          </div>
          
          {jobPhotos.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No photos taken yet</p>
              <p className="text-sm">Tap "Take Photo" to document your work</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {jobPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt={`Job photo ${photo.id}`}
                    className="w-full h-32 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <div>{photo.timestamp.toLocaleTimeString()}</div>
                      {photo.location && (
                        <div className="flex items-center justify-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          GPS
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offline Status Indicator */}
        <div className="fixed bottom-4 right-4 z-30">
          <div className={`px-3 py-2 rounded-full text-sm font-medium shadow-lg ${
            navigator.onLine 
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{navigator.onLine ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <PhotoCaptureComponent
          onPhotoCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
          jobId={job.id}
        />
      )}
    </DashboardLayout>
  )
}