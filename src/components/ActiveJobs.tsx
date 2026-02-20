'use client'

import { Camera, MapPin, Calendar, User } from 'lucide-react'

const jobs = [
  {
    id: 1,
    customer: 'Riverside Restaurant',
    title: 'Kitchen Electrical Work',
    status: 'in-progress',
    progress: 75,
    assignee: 'Mike Johnson',
    location: '123 River St',
    lastUpdate: '3 hours ago',
    photosCount: 24,
  },
  {
    id: 2,
    customer: 'Office Park Building A',
    title: 'Security Camera Installation',
    status: 'scheduled',
    progress: 0,
    assignee: 'Sarah Chen',
    location: '456 Business Blvd',
    lastUpdate: 'Starts Monday',
    photosCount: 0,
  },
  {
    id: 3,
    customer: 'Greenfield Apartments',
    title: 'HVAC Maintenance - Units 12-24',
    status: 'in-progress',
    progress: 45,
    assignee: 'Dave Rodriguez',
    location: '789 Green Ave',
    lastUpdate: '1 day ago',
    photosCount: 15,
  },
  {
    id: 4,
    customer: 'Metro Health Clinic',
    title: 'Network Infrastructure',
    status: 'starting-soon',
    progress: 10,
    assignee: 'Alex Kim',
    location: '321 Health Way',
    lastUpdate: 'Site survey completed',
    photosCount: 8,
  },
]

const statusStyles = {
  'scheduled': 'bg-gray-100 text-gray-800',
  'starting-soon': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completing': 'bg-green-100 text-green-800',
}

export function ActiveJobs() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Active Jobs</h3>
          <span className="text-sm text-gray-500">12 total</span>
        </div>
        
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border-l-4 border-green-400 pl-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {job.customer}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[job.status as keyof typeof statusStyles]}`}>
                      {job.status.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{job.title}</p>
                  
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-900">{job.progress}%</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {job.assignee}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Camera className="h-3 w-3 mr-1" />
                      {job.photosCount} photos
                    </div>
                  </div>
                  
                  <p className="mt-1 text-xs text-gray-400">
                    Last update: {job.lastUpdate}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View all jobs →
          </button>
        </div>
      </div>
    </div>
  )
}