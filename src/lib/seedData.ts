import { offlineStorage, StoredCustomer, StoredJob } from './offlineStorage'

const customerSeeds: Array<Omit<StoredCustomer, 'lastModified'>> = [
  {
    id: 'cust-riverside',
    name: 'Riverside Restaurant Group',
    email: 'ops@riversiderestaurants.com',
    phone: '(212) 555-0111',
    address: '123 River St, Cityville, ST 12345',
    syncStatus: 'synced'
  },
  {
    id: 'cust-officepark',
    name: 'Northpoint Office Park',
    email: 'facilities@northpointoffice.com',
    phone: '(404) 555-0142',
    address: '456 Business Blvd, Suite 200, Cityville, ST 12345',
    syncStatus: 'synced'
  },
  {
    id: 'cust-greenfield',
    name: 'Greenfield Apartments HOA',
    email: 'board@greenfieldhoa.com',
    phone: '(713) 555-0199',
    address: '789 Green Ave, Cityville, ST 12345',
    syncStatus: 'synced'
  },
  {
    id: 'cust-metroclinic',
    name: 'Metro Health Clinic',
    email: 'it@metrohealthclinic.com',
    phone: '(305) 555-1333',
    address: '321 Health Way, Cityville, ST 12345',
    syncStatus: 'synced'
  },
  {
    id: 'cust-downtownretail',
    name: 'Downtown Retail Collective',
    email: 'projects@downtownretail.co',
    phone: '(206) 555-0440',
    address: '555 Main St, Cityville, ST 12345',
    syncStatus: 'synced'
  }
]

const jobSeeds: Array<Omit<StoredJob, 'lastModified'>> = [
  {
    id: 'JOB-001',
    jobNumber: 'JOB-001',
    title: 'Kitchen Electrical Work',
    status: 'in-progress',
    customerId: 'cust-riverside',
    customerName: 'Riverside Restaurant Group',
    technicianId: 'tech-mike',
    technicianName: 'Mike Johnson',
    scheduledDate: '2026-02-12',
    estimatedCompletion: '2026-02-18',
    progress: 75,
    value: 12400,
    photosCount: 24,
    lastUpdateNote: '3 hours ago',
    priority: 'high',
    location: {
      label: 'Downtown Kitchen',
      address: '123 River St, Downtown'
    },
    description: 'Complete rewiring of kitchen service panels plus new GFCI circuits for prep line equipment.',
    notes: 'Coordinate with restaurant GM for after-hours access.',
    photos: [],
    syncStatus: 'synced'
  },
  {
    id: 'JOB-002',
    jobNumber: 'JOB-002',
    title: 'Security Camera Installation',
    status: 'scheduled',
    customerId: 'cust-officepark',
    customerName: 'Northpoint Office Park',
    technicianId: 'tech-sarah',
    technicianName: 'Sarah Chen',
    scheduledDate: '2026-02-17',
    estimatedCompletion: '2026-02-22',
    progress: 0,
    value: 28900,
    photosCount: 0,
    lastUpdateNote: 'Site walk scheduled',
    priority: 'normal',
    location: {
      label: 'Building A',
      address: '456 Business Blvd'
    },
    description: 'Install 32 smart IP cameras with NVR + remote monitoring for common areas and parking deck.',
    notes: 'Awaiting permit finalization from city inspector.',
    photos: [],
    syncStatus: 'synced'
  },
  {
    id: 'JOB-003',
    jobNumber: 'JOB-003',
    title: 'HVAC Maintenance - Units 12-24',
    status: 'in-progress',
    customerId: 'cust-greenfield',
    customerName: 'Greenfield Apartments HOA',
    technicianId: 'tech-dave',
    technicianName: 'Dave Rodriguez',
    scheduledDate: '2026-02-10',
    estimatedCompletion: '2026-02-20',
    progress: 45,
    value: 8200,
    photosCount: 15,
    lastUpdateNote: 'Filter replacements underway',
    priority: 'normal',
    location: {
      label: 'Building 3',
      address: '789 Green Ave'
    },
    description: 'Quarterly maintenance for HVAC split systems across units 12-24 including coil cleaning and diagnostics.',
    notes: 'Need to log refrigerant levels per unit.',
    photos: [],
    syncStatus: 'synced'
  },
  {
    id: 'JOB-004',
    jobNumber: 'JOB-004',
    title: 'Network Infrastructure Setup',
    status: 'starting-soon',
    customerId: 'cust-metroclinic',
    customerName: 'Metro Health Clinic',
    technicianId: 'tech-alex',
    technicianName: 'Alex Kim',
    scheduledDate: '2026-02-19',
    estimatedCompletion: '2026-03-05',
    progress: 10,
    value: 32100,
    photosCount: 8,
    lastUpdateNote: 'Site survey completed',
    priority: 'high',
    location: {
      label: 'Main Clinic',
      address: '321 Health Way'
    },
    description: 'Deploy new CAT6 backbone with managed switches and secure Wi-Fi for clinical spaces.',
    notes: 'Coordinate overnight cut-over with IT director.',
    photos: [],
    syncStatus: 'synced'
  },
  {
    id: 'JOB-005',
    jobNumber: 'JOB-005',
    title: 'Lighting System Upgrade',
    status: 'completed',
    customerId: 'cust-downtownretail',
    customerName: 'Downtown Retail Collective',
    technicianId: 'tech-sarah',
    technicianName: 'Sarah Chen',
    scheduledDate: '2026-02-01',
    estimatedCompletion: '2026-02-10',
    progress: 100,
    value: 15600,
    photosCount: 42,
    lastUpdateNote: 'Completed 5 days ago',
    priority: 'normal',
    location: {
      label: 'Retail Complex',
      address: '555 Main St'
    },
    description: 'Replace halogen track lighting with energy-efficient LED fixtures across 12 storefronts.',
    notes: 'Document power savings for case study.',
    photos: [],
    syncStatus: 'synced'
  }
]

let seedingPromise: Promise<void> | null = null

export async function ensureSeedData() {
  if (typeof window === 'undefined') {
    return
  }

  if (!seedingPromise) {
    seedingPromise = (async () => {
      await offlineStorage.init()
      const alreadySeeded = await offlineStorage.getAppState<boolean>('demo_seeded')
      if (alreadySeeded) {
        return
      }

      const [customerCount, jobCount] = await Promise.all([
        offlineStorage.getAllCustomers().then(records => records.length),
        offlineStorage.getAllJobs().then(records => records.length)
      ])

      if (customerCount === 0) {
        for (const customer of customerSeeds) {
          await offlineStorage.saveCustomer(customer)
        }
      }

      if (jobCount === 0) {
        for (const job of jobSeeds) {
          await offlineStorage.saveJob(job)
        }
      }

      await offlineStorage.setAppState('demo_seeded', true)
    })()
  }

  return seedingPromise
}

export { customerSeeds, jobSeeds }
