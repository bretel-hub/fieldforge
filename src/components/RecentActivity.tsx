'use client'

import { FileText, Camera, DollarSign, User, CheckCircle, Clock } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'proposal_signed',
    message: 'Riverside Restaurant signed proposal for Kitchen Electrical Work',
    value: '$12,400',
    time: '2 hours ago',
    icon: FileText,
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    id: 2,
    type: 'job_photo_uploaded',
    message: 'Mike Johnson uploaded 8 photos to Riverside Restaurant project',
    time: '3 hours ago',
    icon: Camera,
    iconColor: 'text-blue-600 bg-blue-100',
  },
  {
    id: 3,
    type: 'proposal_viewed',
    message: 'Downtown Office Complex viewed HVAC Installation proposal',
    time: '1 day ago',
    icon: FileText,
    iconColor: 'text-yellow-600 bg-yellow-100',
  },
  {
    id: 4,
    type: 'payment_received',
    message: 'Received $5,200 deposit from Metro Health Clinic',
    value: '$5,200',
    time: '1 day ago',
    icon: DollarSign,
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    id: 5,
    type: 'job_completed',
    message: 'Sarah Chen marked Office Park Building security installation as completed',
    time: '2 days ago',
    icon: CheckCircle,
    iconColor: 'text-green-600 bg-green-100',
  },
  {
    id: 6,
    type: 'proposal_created',
    message: 'New proposal created for ABC Manufacturing - Security System Upgrade',
    value: '$45,300',
    time: '3 days ago',
    icon: FileText,
    iconColor: 'text-blue-600 bg-blue-100',
  },
  {
    id: 7,
    type: 'job_started',
    message: 'Dave Rodriguez started HVAC maintenance at Greenfield Apartments',
    time: '4 days ago',
    icon: Clock,
    iconColor: 'text-yellow-600 bg-yellow-100',
  },
  {
    id: 8,
    type: 'customer_added',
    message: 'New customer added: TechStart Coworking Space',
    time: '5 days ago',
    icon: User,
    iconColor: 'text-purple-600 bg-purple-100',
  },
]

export function RecentActivity() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex items-start space-x-3">
                    <div className={`relative px-1 ${activity.iconColor} rounded-full flex h-10 w-10 items-center justify-center`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                            {activity.value && (
                              <span className="ml-2 font-medium text-green-600">
                                {activity.value}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6">
          <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View all activity →
          </button>
        </div>
      </div>
    </div>
  )
}