'use client'

import { ArrowLeft, MapPin, Calendar, DollarSign, User, Phone, Edit } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  customer: string
  title: string
  description: string
  status: string
  progress: number
  assignee: string
  assigneePhone: string
  location: string
  startDate: string
  estimatedCompletion: string
  value: number
  lastUpdate: string
}

interface JobHeaderProps {
  job: Job
}

const statusStyles = {
  'scheduled': 'bg-gray-100 text-gray-800',
  'starting-soon': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'completing': 'bg-green-100 text-green-800',
  'completed': 'bg-green-100 text-green-800',
  'on-hold': 'bg-red-100 text-red-800',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function JobHeader({ job }: JobHeaderProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/jobs"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Jobs
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[job.status as keyof typeof statusStyles]}`}>
              {job.status.replace('-', ' ')}
            </span>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Job ID: {job.id}</div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600 mt-1">{job.customer}</p>
            </div>
            
            <p className="text-gray-700 mb-6">{job.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {job.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                {formatCurrency(job.value)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                {job.assignee}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                {job.assigneePhone}
              </div>
            </div>
          </div>
          
          <div className="lg:pl-8 lg:border-l border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Date:</span>
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(job.startDate)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Est. Completion:</span>
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {formatDate(job.estimatedCompletion)}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Progress</span>
                  <span className="text-sm text-gray-600">{job.progress}% complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      job.status === 'completed' ? 'bg-green-500' :
                      job.status === 'in-progress' ? 'bg-yellow-500' :
                      job.status === 'starting-soon' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Last update: {job.lastUpdate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}