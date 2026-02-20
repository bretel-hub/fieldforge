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
    customerContact: 'Mark Deluca',
    customerEmail: 'ops@riversiderestaurants.com',
    customerPhone: '(212) 555-0111',
    customerAddress: '123 River St, Cityville, ST 12345',
    technicianId: 'tech-mike',
    technicianName: 'Mike Johnson',
    scheduledDate: '2026-02-12',
    estimatedCompletion: '2026-02-18',
    progress: 75,
    value: 12400,
    photosCount: 24,
    lastUpdateNote: '3 hours ago',
    priority: 'high',
    location: { label: 'Downtown Kitchen', address: '123 River St, Downtown' },
    description: 'Complete rewiring of kitchen service panels plus new GFCI circuits for prep line equipment. Work must be completed during off-hours to avoid disrupting restaurant operations.',
    projectTimeline: '5 business days',
    lineItems: [
      { id: 'li-001-1', category: 'Labor', description: 'Licensed electrician – panel rewiring (40 hrs)', quantity: 40, unitPrice: 175, total: 7000 },
      { id: 'li-001-2', category: 'Materials', description: '200A service panel with breakers', quantity: 1, unitPrice: 1850, total: 1850 },
      { id: 'li-001-3', category: 'Materials', description: 'GFCI outlets (20A) and branch wiring', quantity: 1, unitPrice: 2050, total: 2050 },
      { id: 'li-001-4', category: 'Permits', description: 'City electrical permit', quantity: 1, unitPrice: 500, total: 500 },
    ],
    subtotal: 11400,
    taxAmount: 998,
    noteEntries: [
      { id: 'ne-001-1', text: 'Panel work 60% done. Two of four sub-panels rewired and tested. Starting GFCI circuit runs tomorrow.', timestamp: '2026-02-15T14:30:00.000Z' },
      { id: 'ne-001-2', text: 'Confirmed after-hours access with GM (Mark Deluca). Entry via back dock, 10pm–4am window.', timestamp: '2026-02-12T09:15:00.000Z' },
    ],
    photos: [],
    syncStatus: 'synced',
  },
  {
    id: 'JOB-002',
    jobNumber: 'JOB-002',
    title: 'Security Camera Installation',
    status: 'scheduled',
    customerId: 'cust-officepark',
    customerName: 'Northpoint Office Park',
    customerContact: 'Linda Cho',
    customerEmail: 'facilities@northpointoffice.com',
    customerPhone: '(404) 555-0142',
    customerAddress: '456 Business Blvd, Suite 200, Cityville, ST 12345',
    technicianId: 'tech-sarah',
    technicianName: 'Sarah Chen',
    scheduledDate: '2026-02-17',
    estimatedCompletion: '2026-02-22',
    progress: 0,
    value: 28900,
    photosCount: 0,
    lastUpdateNote: 'Site walk scheduled',
    priority: 'normal',
    location: { label: 'Building A', address: '456 Business Blvd' },
    description: 'Install 32 smart IP cameras with NVR + remote monitoring for common areas, lobbies, and parking deck. Includes cable runs, mounting hardware, and remote access setup.',
    projectTimeline: '1 week',
    lineItems: [
      { id: 'li-002-1', category: 'Equipment', description: 'Smart IP cameras (4K, PoE)', quantity: 32, unitPrice: 420, total: 13440 },
      { id: 'li-002-2', category: 'Equipment', description: '32-channel NVR with 8TB storage', quantity: 1, unitPrice: 3200, total: 3200 },
      { id: 'li-002-3', category: 'Materials', description: 'Cat6 cabling, conduit & mounting hardware', quantity: 1, unitPrice: 2400, total: 2400 },
      { id: 'li-002-4', category: 'Labor', description: 'Installation & cabling (32 hrs)', quantity: 32, unitPrice: 165, total: 5280 },
      { id: 'li-002-5', category: 'Labor', description: 'NVR programming & remote access setup', quantity: 8, unitPrice: 165, total: 1320 },
      { id: 'li-002-6', category: 'Permits', description: 'Low-voltage installation permit', quantity: 1, unitPrice: 960, total: 960 },
    ],
    subtotal: 26600,
    taxAmount: 2328,
    noteEntries: [
      { id: 'ne-002-1', text: 'Permit application submitted. Awaiting city inspector sign-off before we can begin cabling.', timestamp: '2026-02-14T10:00:00.000Z' },
    ],
    photos: [],
    syncStatus: 'synced',
  },
  {
    id: 'JOB-003',
    jobNumber: 'JOB-003',
    title: 'HVAC Maintenance - Units 12-24',
    status: 'in-progress',
    customerId: 'cust-greenfield',
    customerName: 'Greenfield Apartments HOA',
    customerContact: 'Patricia Wells',
    customerEmail: 'board@greenfieldhoa.com',
    customerPhone: '(713) 555-0199',
    customerAddress: '789 Green Ave, Cityville, ST 12345',
    technicianId: 'tech-dave',
    technicianName: 'Dave Rodriguez',
    scheduledDate: '2026-02-10',
    estimatedCompletion: '2026-02-20',
    progress: 45,
    value: 8200,
    photosCount: 15,
    lastUpdateNote: 'Filter replacements underway',
    priority: 'normal',
    location: { label: 'Building 3', address: '789 Green Ave' },
    description: 'Quarterly maintenance for HVAC split systems across units 12-24. Includes coil cleaning, filter replacement, refrigerant checks, and full diagnostic report for each unit.',
    projectTimeline: '8 business days',
    lineItems: [
      { id: 'li-003-1', category: 'Labor', description: 'HVAC technician (24 hrs)', quantity: 24, unitPrice: 145, total: 3480 },
      { id: 'li-003-2', category: 'Materials', description: 'MERV-11 filters (13 units)', quantity: 13, unitPrice: 85, total: 1105 },
      { id: 'li-003-3', category: 'Materials', description: 'Coil cleaning supplies & descaler', quantity: 1, unitPrice: 580, total: 580 },
      { id: 'li-003-4', category: 'Equipment', description: 'Refrigerant top-off per unit (R-410A)', quantity: 13, unitPrice: 125, total: 1625 },
      { id: 'li-003-5', category: 'Other', description: 'Full diagnostic report (13 units)', quantity: 1, unitPrice: 750, total: 750 },
    ],
    subtotal: 7540,
    taxAmount: 660,
    noteEntries: [
      { id: 'ne-003-1', text: 'Filter replacements done on units 12–17. Coil cleaning in progress. Unit 14 needs refrigerant top-off — noted for tomorrow.', timestamp: '2026-02-14T16:45:00.000Z' },
      { id: 'ne-003-2', text: 'Started work. All units accessible. Keys collected from HOA office (Patricia Wells).', timestamp: '2026-02-10T08:00:00.000Z' },
    ],
    photos: [],
    syncStatus: 'synced',
  },
  {
    id: 'JOB-004',
    jobNumber: 'JOB-004',
    title: 'Network Infrastructure Setup',
    status: 'scheduled',
    customerId: 'cust-metroclinic',
    customerName: 'Metro Health Clinic',
    customerContact: 'James Ortega',
    customerEmail: 'it@metrohealthclinic.com',
    customerPhone: '(305) 555-1333',
    customerAddress: '321 Health Way, Cityville, ST 12345',
    technicianId: 'tech-alex',
    technicianName: 'Alex Kim',
    scheduledDate: '2026-02-19',
    estimatedCompletion: '2026-03-05',
    progress: 10,
    value: 32100,
    photosCount: 8,
    lastUpdateNote: 'Site survey completed',
    priority: 'high',
    location: { label: 'Main Clinic', address: '321 Health Way' },
    description: 'Deploy new CAT6 backbone with managed switches and secure Wi-Fi for clinical spaces. Network must meet HIPAA compliance requirements. Overnight cut-over required to minimize downtime.',
    projectTimeline: '12 business days',
    lineItems: [
      { id: 'li-004-1', category: 'Equipment', description: 'Managed PoE switches (3x 48-port)', quantity: 3, unitPrice: 2800, total: 8400 },
      { id: 'li-004-2', category: 'Equipment', description: 'Enterprise wireless APs (802.11ax)', quantity: 12, unitPrice: 650, total: 7800 },
      { id: 'li-004-3', category: 'Materials', description: 'CAT6 cable, patch panels, keystones', quantity: 1, unitPrice: 5280, total: 5280 },
      { id: 'li-004-4', category: 'Labor', description: 'Cabling & termination (40 hrs)', quantity: 40, unitPrice: 155, total: 6200 },
      { id: 'li-004-5', category: 'Labor', description: 'Switch & AP configuration (8 hrs)', quantity: 8, unitPrice: 195, total: 1560 },
      { id: 'li-004-6', category: 'Permits', description: 'Low-voltage permit', quantity: 1, unitPrice: 300, total: 300 },
    ],
    subtotal: 29540,
    taxAmount: 2585,
    noteEntries: [
      { id: 'ne-004-1', text: 'Site survey complete. Cable paths mapped, 14 drops required on second floor (more than estimated). Will need to revise quote slightly — speaking with James Ortega.', timestamp: '2026-02-18T11:30:00.000Z' },
    ],
    photos: [],
    syncStatus: 'synced',
  },
  {
    id: 'JOB-005',
    jobNumber: 'JOB-005',
    title: 'Lighting System Upgrade',
    status: 'complete',
    customerId: 'cust-downtownretail',
    customerName: 'Downtown Retail Collective',
    customerContact: 'Renata Morales',
    customerEmail: 'projects@downtownretail.co',
    customerPhone: '(206) 555-0440',
    customerAddress: '555 Main St, Cityville, ST 12345',
    technicianId: 'tech-sarah',
    technicianName: 'Sarah Chen',
    scheduledDate: '2026-02-01',
    estimatedCompletion: '2026-02-10',
    progress: 100,
    value: 15600,
    photosCount: 42,
    lastUpdateNote: 'Completed 5 days ago',
    priority: 'normal',
    location: { label: 'Retail Complex', address: '555 Main St' },
    description: 'Replace halogen track lighting with energy-efficient LED fixtures across 12 storefronts. Customer expects 40–50% reduction in energy costs. Before/after photos required for case study.',
    projectTimeline: '8 business days',
    lineItems: [
      { id: 'li-005-1', category: 'Equipment', description: 'LED track fixtures (6 per storefront × 12)', quantity: 72, unitPrice: 95, total: 6840 },
      { id: 'li-005-2', category: 'Equipment', description: 'LED drivers & dimmers', quantity: 24, unitPrice: 60, total: 1440 },
      { id: 'li-005-3', category: 'Materials', description: 'Electrical hardware & mounting hardware', quantity: 1, unitPrice: 870, total: 870 },
      { id: 'li-005-4', category: 'Labor', description: 'Installation & circuit testing (32 hrs)', quantity: 32, unitPrice: 155, total: 4960 },
      { id: 'li-005-5', category: 'Labor', description: 'Final walkthrough & documentation', quantity: 1, unitPrice: 240, total: 240 },
    ],
    subtotal: 14350,
    taxAmount: 1256,
    noteEntries: [
      { id: 'ne-005-1', text: 'Job complete. All 12 storefronts done. Final walkthrough passed. Before/after photos taken and uploaded. Renata signed off on completion.', timestamp: '2026-02-10T15:00:00.000Z' },
      { id: 'ne-005-2', text: 'Storefronts 7–12 done. Energy monitor baseline readings logged for each unit. Everything looks great.', timestamp: '2026-02-08T17:00:00.000Z' },
      { id: 'ne-005-3', text: 'Storefronts 1–6 complete. All fixtures installed and tested. Moving to second half tomorrow.', timestamp: '2026-02-05T16:30:00.000Z' },
    ],
    photos: [],
    syncStatus: 'synced',
  },
]

let seedingPromise: Promise<void> | null = null

export async function ensureSeedData() {
  if (typeof window === 'undefined') {
    return
  }

  if (!seedingPromise) {
    seedingPromise = (async () => {
      await offlineStorage.init()
      const alreadySeeded = await offlineStorage.getAppState<boolean>('demo_seeded_v2')
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

      await offlineStorage.setAppState('demo_seeded_v2', true)
    })()
  }

  return seedingPromise
}

export { customerSeeds, jobSeeds }
