'use client'

import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react'

interface Job {
  id: string
  customer: string
  title: string
  status: string
  progress: number
  assignee: string
}

interface JobProgressProps {
  job: Job
}

// Mock checklist items
const checklistItems = [
  {
    id: '1',
    title: 'Site survey and assessment',
    completed: true,
    completedAt: '2026-02-12T09:00:00Z',
    completedBy: 'Mike Johnson',
  },
  {
    id: '2',
    title: 'Materials delivery and inspection',
    completed: true,
    completedAt: '2026-02-12T14:30:00Z',
    completedBy: 'Mike Johnson',
  },
  {
    id: '3',
    title: 'Disconnect old electrical panel',
    completed: true,
    completedAt: '2026-02-13T10:15:00Z',
    completedBy: 'Mike Johnson',
  },
  {
    id: '4',
    title: 'Install new electrical panel',
    completed: true,
    completedAt: '2026-02-14T16:45:00Z',
    completedBy: 'Mike Johnson',
  },
  {
    id: '5',
    title: 'Run new conduit and wiring',
    completed: false,
    inProgress: true,
  },
  {
    id: '6',
    title: 'Install GFCI outlets',
    completed: false,
  },
  {
    id: '7',
    title: 'Connect equipment loads',
    completed: false,
  },
  {
    id: '8',
    title: 'Testing and commissioning',
    completed: false,
  },
  {
    id: '9',
    title: 'Final inspection',
    completed: false,
  },
  {
    id: '10',
    title: 'Customer walkthrough',
    completed: false,
  },
]

const milestones = [
  {
    id: '1',
    title: 'Project Started',
    date: '2026-02-12',
    completed: true,
    description: 'Site survey completed, materials ordered',
  },
  {
    id: '2',
    title: 'Materials Received',
    date: '2026-02-12',
    completed: true,
    description: 'All electrical components delivered and inspected',
  },
  {
    id: '3',
    title: 'Panel Replacement',
    date: '2026-02-14',
    completed: true,
    description: 'Old panel removed, new panel installed and energized',
  },
  {
    id: '4',
    title: 'Rough-in Complete',
    date: '2026-02-16',
    completed: false,
    current: true,
    description: 'All conduit and wiring installation',
  },
  {
    id: '5',
    title: 'Final Connections',
    date: '2026-02-17',
    completed: false,
    description: 'Equipment connections and testing',
  },
  {
    id: '6',
    title: 'Project Complete',
    date: '2026-02-18',
    completed: false,
    description: 'Inspection passed, customer sign-off',
  },
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function JobProgress({ job }: JobProgressProps) {
  const completedTasks = checklistItems.filter(item => item.completed).length
  const totalTasks = checklistItems.length
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Summary</h3>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Overall Progress</span>
            <span className="text-sm text-gray-600">{progressPercentage}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <div className="text-sm text-gray-500">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalTasks - completedTasks}</div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Milestones</h3>
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {index !== milestones.length - 1 && (
                <div className={`absolute left-4 top-8 w-0.5 h-8 ${milestone.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
              
              <div className="flex items-start space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  milestone.completed 
                    ? 'bg-green-500 text-white' 
                    : milestone.current 
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {milestone.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : milestone.current ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${milestone.completed ? 'text-gray-900' : milestone.current ? 'text-yellow-700' : 'text-gray-500'}`}>
                      {milestone.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(milestone.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Checklist */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Task Checklist</h3>
        
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                item.completed ? 'bg-green-50' : item.inProgress ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              <div className={`flex items-center justify-center w-5 h-5 rounded-full mt-0.5 ${
                item.completed 
                  ? 'bg-green-500 text-white' 
                  : item.inProgress 
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-300 text-gray-500'
              }`}>
                {item.completed ? (
                  <CheckCircle className="h-4 w-4" />
                ) : item.inProgress ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  item.completed ? 'text-green-900 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                </p>
                {item.completed && item.completedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed by {item.completedBy} on {formatDateTime(item.completedAt)}
                  </p>
                )}
                {item.inProgress && (
                  <p className="text-xs text-yellow-600 mt-1">
                    In progress
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}