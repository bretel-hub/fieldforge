'use client'

import { Calendar, User, MapPin, Camera } from 'lucide-react'
import { CustomerPhotoGallery } from '@/components/CustomerPhotoGallery'

interface Job {
  id: string
  title: string
  status: string
  progress: number
  assignee: string
  startDate: string
  estimatedCompletion: string
  lastUpdate: string
  description: string
}

interface CustomerJobViewProps {
  job: Job
  customerId: string
}

const statusStyles = {
  'scheduled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Scheduled' },
  'starting-soon': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Starting Soon' },
  'in-progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
  'completing': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completing' },
  'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  'on-hold': { bg: 'bg-red-100', text: 'text-red-800', label: 'On Hold' },
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function CustomerJobView({ job, customerId }: CustomerJobViewProps) {
  const statusConfig = statusStyles[job.status as keyof typeof statusStyles]

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">Job {job.id}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.label}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-medium text-gray-900">Project Progress</h4>
            <span className="text-lg font-semibold text-gray-900">{job.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                job.status === 'completed' ? 'bg-green-500' :
                job.status === 'in-progress' ? 'bg-blue-500' :
                job.status === 'completing' ? 'bg-green-400' :
                'bg-gray-400'
              }`}
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{job.description}</p>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">Project Lead</p>
              <p className="text-sm text-gray-600">{job.assignee}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">Timeline</p>
              <p className="text-sm text-gray-600">
                {formatDate(job.startDate)} - {formatDate(job.estimatedCompletion)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Camera className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">Last Update</p>
              <p className="text-sm text-gray-600">{job.lastUpdate}</p>
            </div>
          </div>
        </div>

        {/* Status-specific messages */}
        {job.status === 'scheduled' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-blue-800 mb-2">Project Scheduled</h5>
            <p className="text-blue-700 text-sm">
              Your project is scheduled to begin on {formatDate(job.startDate)}. 
              Our team will contact you shortly to confirm details and access.
            </p>
          </div>
        )}

        {job.status === 'in-progress' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-yellow-800 mb-2">Work in Progress</h5>
            <p className="text-yellow-700 text-sm">
              Our team is actively working on your project. Check back here for photo updates and progress reports.
            </p>
          </div>
        )}

        {job.status === 'completing' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-green-800 mb-2">Nearing Completion</h5>
            <p className="text-green-700 text-sm">
              We're in the final stages of your project. Final inspection and walkthrough will be scheduled soon.
            </p>
          </div>
        )}

        {job.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-green-800 mb-2">Project Completed!</h5>
            <p className="text-green-700 text-sm">
              Your project has been completed successfully. Thank you for choosing FieldForge!
            </p>
          </div>
        )}

        {/* Photo Gallery */}
        <CustomerPhotoGallery jobId={job.id} />

        {/* Contact Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Questions About Your Project?</h5>
            <p className="text-gray-600 text-sm mb-3">
              Contact your project lead directly or reach out to our support team.
            </p>
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                Contact {job.assignee}
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                Support Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}