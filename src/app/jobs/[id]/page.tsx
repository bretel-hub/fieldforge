import { DashboardLayout } from '@/components/DashboardLayout'
import { JobHeader } from '@/components/JobHeader'
import { PhotoGallery } from '@/components/PhotoGallery'
import { JobProgress } from '@/components/JobProgress'
import { JobNotes } from '@/components/JobNotes'

// Mock job data - in real app this would come from database
const getJobById = (id: string) => {
  const jobs = {
    'JOB-001': {
      id: 'JOB-001',
      customer: 'Riverside Restaurant',
      title: 'Kitchen Electrical Work',
      description: 'Complete electrical upgrade for commercial kitchen including new panel, outlets, and equipment connections.',
      status: 'in-progress',
      progress: 75,
      assignee: 'Mike Johnson',
      assigneePhone: '(555) 123-4567',
      location: '123 River St, Downtown',
      startDate: '2026-02-12',
      estimatedCompletion: '2026-02-18',
      value: 12400,
      lastUpdate: '3 hours ago',
    },
    'JOB-002': {
      id: 'JOB-002',
      customer: 'Office Park Building A',
      title: 'Security Camera Installation',
      description: '16-camera security system installation with network infrastructure and monitoring setup.',
      status: 'scheduled',
      progress: 0,
      assignee: 'Sarah Chen',
      assigneePhone: '(555) 987-6543',
      location: '456 Business Blvd',
      startDate: '2026-02-17',
      estimatedCompletion: '2026-02-22',
      value: 28900,
      lastUpdate: 'Scheduled',
    },
  }
  
  return jobs[id as keyof typeof jobs] || null
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = getJobById(params.id)
  
  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Job Not Found</h1>
          <p className="text-gray-600 mt-2">The job you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <JobHeader job={job} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PhotoGallery jobId={job.id} />
            <JobNotes jobId={job.id} />
          </div>
          
          <div className="space-y-8">
            <JobProgress job={job} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}