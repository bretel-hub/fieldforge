import { CustomerPortalLayout } from '@/components/CustomerPortalLayout'
import { CustomerProposalView } from '@/components/CustomerProposalView'
import { CustomerJobView } from '@/components/CustomerJobView'
import { notFound } from 'next/navigation'

// Mock customer data - in real app this would come from database
const getCustomerBySlug = (customerId: string) => {
  const customers = {
    'abc-manufacturing': {
      id: 'abc-manufacturing',
      name: 'ABC Manufacturing',
      contact: 'John Smith',
      email: 'john@abc-manufacturing.com',
      proposals: [
        {
          id: 'PROP-001',
          title: 'Security System Upgrade',
          value: 45300,
          status: 'pending',
          created: '2026-02-12',
          lastViewed: '2026-02-15 14:30',
          description: 'Complete security system overhaul including cameras, access control, and monitoring equipment.',
          tiers: [
            {
              name: 'Essential Security Package',
              total: 35600,
              description: 'Basic camera system with 8 cameras and central monitoring',
            },
            {
              name: 'Professional Security Package',
              total: 45300,
              description: '16 cameras, access control, and mobile alerts',
              recommended: true,
            },
            {
              name: 'Premium Security Package', 
              total: 58900,
              description: 'Complete system with AI analytics and 24/7 monitoring',
            },
          ],
        },
      ],
      jobs: [], // No active jobs yet
    },
    'riverside-restaurant': {
      id: 'riverside-restaurant',
      name: 'Riverside Restaurant',
      contact: 'Maria Rodriguez',
      email: 'maria@riverside-restaurant.com',
      proposals: [
        {
          id: 'PROP-003',
          title: 'Kitchen Electrical Work',
          value: 12400,
          status: 'signed',
          created: '2026-02-13',
          signedAt: '2026-02-13 15:30',
          description: 'Complete electrical upgrade for commercial kitchen including new panel, outlets, and equipment connections.',
        },
      ],
      jobs: [
        {
          id: 'JOB-001',
          title: 'Kitchen Electrical Work',
          status: 'in-progress',
          progress: 75,
          assignee: 'Mike Johnson',
          startDate: '2026-02-12',
          estimatedCompletion: '2026-02-18',
          lastUpdate: '3 hours ago',
          description: 'Your kitchen electrical upgrade is progressing well. We\'ve completed the new panel installation and are working on the outlet connections.',
        },
      ],
    },
    'office-park-building-a': {
      id: 'office-park-building-a',
      name: 'Office Park Building A',
      contact: 'David Chen',
      email: 'david@officepark.com',
      proposals: [
        {
          id: 'PROP-002',
          title: 'Security Camera Installation',
          value: 28900,
          status: 'viewed',
          created: '2026-02-08',
          lastViewed: '2026-02-14 09:15',
          description: '16-camera security system installation with network infrastructure and monitoring setup.',
        },
      ],
      jobs: [
        {
          id: 'JOB-002',
          title: 'Security Camera Installation',
          status: 'scheduled',
          progress: 0,
          assignee: 'Sarah Chen',
          startDate: '2026-02-17',
          estimatedCompletion: '2026-02-22',
          lastUpdate: 'Scheduled to begin Monday',
          description: 'Your security camera installation is scheduled to begin Monday. Our team will contact you to confirm access and timing.',
        },
      ],
    },
  }
  
  return customers[customerId as keyof typeof customers] || null
}

export default function CustomerPortalPage({ params }: { params: { customerId: string } }) {
  const customer = getCustomerBySlug(params.customerId)
  
  if (!customer) {
    notFound()
  }

  return (
    <CustomerPortalLayout customer={customer}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {customer.contact}!</h1>
          <p className="text-lg text-gray-600 mt-2">
            Here's the latest on your projects with FieldForge
          </p>
        </div>

        {/* Active Jobs */}
        {customer.jobs.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Active Projects</h2>
            <div className="space-y-6">
              {customer.jobs.map((job) => (
                <CustomerJobView key={job.id} job={job} customerId={customer.id} />
              ))}
            </div>
          </div>
        )}

        {/* Proposals */}
        {customer.proposals.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {customer.jobs.length > 0 ? 'Recent Proposals' : 'Your Proposals'}
            </h2>
            <div className="space-y-6">
              {customer.proposals.map((proposal) => (
                <CustomerProposalView key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {customer.jobs.length === 0 && customer.proposals.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No active projects</h3>
            <p className="text-gray-600">
              We'll update this portal when you have proposals or active projects with us.
            </p>
          </div>
        )}
      </div>
    </CustomerPortalLayout>
  )
}