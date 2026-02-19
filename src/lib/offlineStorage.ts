// Offline Storage Service using IndexedDB for FieldForge PWA
import { openDB, DBSchema, IDBPDatabase } from 'idb'

export type JobStatus =
  | 'not-started'
  | 'scheduled'
  | 'in-progress'
  | 'complete'
  | 'on-hold'

export interface StoredJob {
  id: string
  jobNumber?: string
  title: string
  status: JobStatus
  customerId: string
  customerName: string
  technicianId: string
  technicianName?: string
  scheduledDate: string
  estimatedCompletion?: string
  progress?: number
  value?: number
  photosCount?: number
  lastUpdateNote?: string
  priority?: 'low' | 'normal' | 'high'
  location: {
    label?: string
    address: string
    coordinates?: [number, number]
  }
  description: string
  notes?: string
  photos?: string[]
  syncStatus: 'synced' | 'pending' | 'failed'
  lastModified: number
}

export interface StoredTask {
  id: string
  jobId: string
  title: string
  description: string
  completed: boolean
  completedAt?: string
  notes?: string
  photos?: string[]
  syncStatus: 'synced' | 'pending' | 'failed'
  lastModified: number
}

export interface StoredPhoto {
  id: string
  jobId?: string
  taskId?: string
  fileName: string
  blob: Blob
  dataUrl?: string
  mimeType: string
  size: number
  capturedAt: string
  location?: {
    latitude: number
    longitude: number
    accuracy?: number
  }
  syncStatus: 'synced' | 'pending' | 'failed'
  lastModified: number
}

export interface StoredCustomer {
  id: string
  name: string
  email?: string
  phone?: string
  address: string
  syncStatus: 'synced' | 'pending' | 'failed'
  lastModified: number
}

type SyncEntity = StoredJob | StoredTask | StoredCustomer | StoredPhoto

export interface SyncQueueItem {
  id: string
  type: 'job' | 'task' | 'customer' | 'photo'
  action: 'create' | 'update' | 'delete'
  data: SyncEntity
  url: string
  method: string
  headers?: Record<string, string>
  timestamp: number
  retryCount: number
  priority: 'low' | 'normal' | 'high'
}

interface FieldForgeDB extends DBSchema {
  jobs: {
    key: string
    value: StoredJob
    indexes: {
      'by-status': string
      'by-technician': string
      'by-sync-status': string
      'by-date': string
    }
  }
  tasks: {
    key: string
    value: StoredTask
    indexes: {
      'by-job': string
      'by-completed': number
      'by-sync-status': string
    }
  }
  customers: {
    key: string
    value: StoredCustomer
    indexes: {
      'by-name': string
      'by-sync-status': string
    }
  }
  photos: {
    key: string
    value: StoredPhoto
    indexes: {
      'by-job': string
      'by-task': string
      'by-sync-status': string
      'by-date': string
    }
  }
  sync_queue: {
    key: string
    value: SyncQueueItem
    indexes: {
      'by-type': string
      'by-timestamp': number
      'by-priority': string
    }
  }
  app_state: {
    key: string
    value: {
      key: string
      value: unknown
      timestamp: number
    }
  }
}

class OfflineStorageService {
  private db: IDBPDatabase<FieldForgeDB> | null = null
  private readonly DB_NAME = 'FieldForgeDB'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    if (this.db) return // Already initialized

    this.db = await openDB<FieldForgeDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Jobs store
        if (!db.objectStoreNames.contains('jobs')) {
          const jobStore = db.createObjectStore('jobs', { keyPath: 'id' })
          jobStore.createIndex('by-status', 'status')
          jobStore.createIndex('by-technician', 'technicianId')
          jobStore.createIndex('by-sync-status', 'syncStatus')
          jobStore.createIndex('by-date', 'scheduledDate')
        }

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
          taskStore.createIndex('by-job', 'jobId')
          taskStore.createIndex('by-completed', 'completed')
          taskStore.createIndex('by-sync-status', 'syncStatus')
        }

        // Customers store
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' })
          customerStore.createIndex('by-name', 'name')
          customerStore.createIndex('by-sync-status', 'syncStatus')
        }

        // Photos store - most important for camera functionality
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' })
          photoStore.createIndex('by-job', 'jobId')
          photoStore.createIndex('by-task', 'taskId')
          photoStore.createIndex('by-sync-status', 'syncStatus')
          photoStore.createIndex('by-date', 'capturedAt')
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          syncStore.createIndex('by-type', 'type')
          syncStore.createIndex('by-timestamp', 'timestamp')
          syncStore.createIndex('by-priority', 'priority')
        }

        // App state store
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' })
        }
      }
    })

    console.log('FieldForge offline storage initialized')
  }

  // === PHOTO OPERATIONS === (Primary focus for camera functionality)
  
  async savePhoto(photo: Omit<StoredPhoto, 'lastModified'>): Promise<void> {
    await this.ensureInit()
    
    const photoWithTimestamp = {
      ...photo,
      lastModified: Date.now()
    }

    await this.db!.put('photos', photoWithTimestamp)
    
    if (photo.syncStatus === 'pending') {
      await this.queueForSync('photo', 'create', photoWithTimestamp)
    }

    console.log('Photo saved to offline storage:', photo.id)
  }

  async getPhoto(id: string): Promise<StoredPhoto | undefined> {
    await this.ensureInit()
    return this.db!.get('photos', id)
  }

  async getPhotosByJob(jobId: string): Promise<StoredPhoto[]> {
    await this.ensureInit()
    return this.db!.getAllFromIndex('photos', 'by-job', jobId)
  }

  async getPhotosByTask(taskId: string): Promise<StoredPhoto[]> {
    await this.ensureInit()
    return this.db!.getAllFromIndex('photos', 'by-task', taskId)
  }

  async getPendingPhotos(): Promise<StoredPhoto[]> {
    await this.ensureInit()
    return this.db!.getAllFromIndex('photos', 'by-sync-status', 'pending')
  }

  async deletePhoto(id: string): Promise<void> {
    await this.ensureInit()
    await this.db!.delete('photos', id)
    console.log('Photo deleted from offline storage:', id)
  }

  // === JOB OPERATIONS ===

  async saveJob(job: Omit<StoredJob, 'lastModified'>): Promise<void> {
    await this.ensureInit()
    
    const jobWithTimestamp = {
      ...job,
      lastModified: Date.now()
    }

    const existingJob = await this.db!.get('jobs', job.id)
    await this.db!.put('jobs', jobWithTimestamp)
    
    if (job.syncStatus === 'pending') {
      await this.queueForSync('job', existingJob ? 'update' : 'create', jobWithTimestamp)
    }
  }

  async getJob(id: string): Promise<StoredJob | undefined> {
    await this.ensureInit()
    return this.db!.get('jobs', id)
  }

  async getAllJobs(): Promise<StoredJob[]> {
    await this.ensureInit()
    return this.db!.getAll('jobs')
  }

  async getJobsByTechnician(technicianId: string): Promise<StoredJob[]> {
    await this.ensureInit()
    return this.db!.getAllFromIndex('jobs', 'by-technician', technicianId)
  }

  async getJobsByStatus(status: StoredJob['status']): Promise<StoredJob[]> {
    await this.ensureInit()
    return this.db!.getAllFromIndex('jobs', 'by-status', status)
  }

  // === CUSTOMER OPERATIONS ===

  async saveCustomer(customer: Omit<StoredCustomer, 'lastModified'>): Promise<void> {
    await this.ensureInit()

    const customerWithTimestamp = {
      ...customer,
      lastModified: Date.now()
    }

    const existingCustomer = await this.db!.get('customers', customer.id)
    await this.db!.put('customers', customerWithTimestamp)

    if (customer.syncStatus === 'pending') {
      await this.queueForSync('customer', existingCustomer ? 'update' : 'create', customerWithTimestamp)
    }
  }

  async getCustomer(id: string): Promise<StoredCustomer | undefined> {
    await this.ensureInit()
    return this.db!.get('customers', id)
  }

  async getAllCustomers(): Promise<StoredCustomer[]> {
    await this.ensureInit()
    return this.db!.getAll('customers')
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.ensureInit()
    await this.db!.delete('customers', id)
  }

  // === TASK OPERATIONS ===

  async saveTask(task: Omit<StoredTask, 'lastModified'>): Promise<void> {
    await this.ensureInit()
    
    const taskWithTimestamp = {
      ...task,
      lastModified: Date.now()
    }

    const existingTask = await this.db!.get('tasks', task.id)
    await this.db!.put('tasks', taskWithTimestamp)
    
    if (task.syncStatus === 'pending') {
      await this.queueForSync('task', existingTask ? 'update' : 'create', taskWithTimestamp)
    }
  }

  async getTasksByJob(jobId: string): Promise<StoredTask[]> {
    await this.ensureInit()
    return this.db!.getAllFromIndex('tasks', 'by-job', jobId)
  }

  // === SYNC QUEUE OPERATIONS ===

  private async queueForSync(
    type: SyncQueueItem['type'],
    action: SyncQueueItem['action'],
    data: SyncEntity,
    priority: SyncQueueItem['priority'] = 'normal'
  ): Promise<void> {
    await this.ensureInit()
    
    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      type,
      action,
      data,
      url: this.getApiUrl(type, action, data.id),
      method: this.getHttpMethod(action),
      headers: type === 'photo' ? {} : { 'Content-Type': 'application/json' },
      timestamp: Date.now(),
      retryCount: 0,
      priority
    }

    await this.db!.put('sync_queue', queueItem)
    console.log('Queued for sync:', queueItem.id, type, action)
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.ensureInit()
    const items = await this.db!.getAll('sync_queue')
    
    // Sort by priority (high > normal > low) then by timestamp
    return items.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
    })
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    await this.ensureInit()
    await this.db!.delete('sync_queue', id)
  }

  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    await this.ensureInit()
    await this.db!.put('sync_queue', item)
  }

  // === APP STATE OPERATIONS ===

  async setAppState(key: string, value: unknown): Promise<void> {
    await this.ensureInit()
    await this.db!.put('app_state', {
      key,
      value,
      timestamp: Date.now()
    })
  }

  async getAppState<T>(key: string): Promise<T | undefined> {
    await this.ensureInit()
    const result = await this.db!.get('app_state', key)
    return result?.value as T | undefined
  }

  // === SYNC OPERATIONS ===

  async processSync(): Promise<{ success: number; failed: number }> {
    if (!navigator.onLine) {
      console.log('Offline - skipping sync')
      return { success: 0, failed: 0 }
    }

    await this.ensureInit()
    const queue = await this.getSyncQueue()
    const maxRetries = 3
    let success = 0
    let failed = 0

    for (const item of queue) {
      if (item.retryCount >= maxRetries) {
        await this.removeSyncQueueItem(item.id)
        failed++
        continue
      }

      try {
        let body: string | FormData | undefined

        if (item.type === 'photo') {
          // Handle photo uploads with FormData
          const photoData = item.data as StoredPhoto
          const formData = new FormData()
          formData.append('file', photoData.blob, photoData.fileName)
          formData.append('jobId', photoData.jobId || '')
          formData.append('taskId', photoData.taskId || '')
          formData.append('capturedAt', photoData.capturedAt)
          
          if (photoData.location) {
            formData.append('latitude', photoData.location.latitude.toString())
            formData.append('longitude', photoData.location.longitude.toString())
            if (photoData.location.accuracy) {
              formData.append('accuracy', photoData.location.accuracy.toString())
            }
          }
          
          body = formData
        } else {
          body = JSON.stringify(item.data)
        }

        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body
        })

        if (response.ok) {
          // Update sync status in local storage
          await this.updateSyncStatus(item.type, item.data.id, 'synced')
          await this.removeSyncQueueItem(item.id)
          success++
          console.log('Synced successfully:', item.type, item.data.id)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (error) {
        // Increment retry count
        item.retryCount++
        await this.updateSyncQueueItem(item)
        console.error(`Sync failed for ${item.type} ${item.data.id}:`, error)
        
        if (item.retryCount >= maxRetries) {
          failed++
        }
      }
    }

    console.log(`Sync complete: ${success} successful, ${failed} failed`)
    return { success, failed }
  }

  private async updateSyncStatus(
    type: 'job' | 'task' | 'customer' | 'photo',
    id: string,
    status: 'synced' | 'pending' | 'failed'
  ): Promise<void> {
    await this.ensureInit()
    const storeName = this.getStoreName(type)
    const record = await this.db!.get(storeName, id)

    if (record) {
      record.syncStatus = status
      record.lastModified = Date.now()
      await this.db!.put(storeName, record)
    }
  }

  private getStoreName(type: 'job' | 'task' | 'customer' | 'photo'): 'jobs' | 'tasks' | 'customers' | 'photos' {
    switch (type) {
      case 'job':
        return 'jobs'
      case 'task':
        return 'tasks'
      case 'customer':
        return 'customers'
      case 'photo':
        return 'photos'
      default:
        return 'jobs'
    }
  }

  // === UTILITY METHODS ===

  private async ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init()
    }
  }

  private getApiUrl(type: string, action: string, id?: string): string {
    const baseUrl = '/api'
    const plural = type + 's'
    
    switch (action) {
      case 'create':
        return `${baseUrl}/${plural}`
      case 'update':
        return `${baseUrl}/${plural}/${id}`
      case 'delete':
        return `${baseUrl}/${plural}/${id}`
      default:
        return `${baseUrl}/${plural}`
    }
  }

  private getHttpMethod(action: string): string {
    switch (action) {
      case 'create': return 'POST'
      case 'update': return 'PUT'
      case 'delete': return 'DELETE'
      default: return 'GET'
    }
  }

  // === CLEANUP METHODS ===

  async clearAllData(): Promise<void> {
    await this.ensureInit()
    
    await this.db!.clear('jobs')
    await this.db!.clear('tasks')
    await this.db!.clear('customers')
    await this.db!.clear('photos')
    await this.db!.clear('sync_queue')
    await this.db!.clear('app_state')
    
    console.log('All offline data cleared')
  }

  async getStorageStats(): Promise<{
    jobs: number
    tasks: number
    customers: number
    photos: number
    syncQueue: number
    totalSize: string
  }> {
    await this.ensureInit()
    
    const [jobs, tasks, customers, photos, syncQueue] = await Promise.all([
      this.db!.count('jobs'),
      this.db!.count('tasks'),
      this.db!.count('customers'),
      this.db!.count('photos'),
      this.db!.count('sync_queue')
    ])

    // Estimate storage size (rough calculation)
    const photosData = await this.db!.getAll('photos')
    const totalPhotoSize = photosData.reduce((sum, photo) => sum + photo.size, 0)
    const totalSize = this.formatBytes(totalPhotoSize)

    return {
      jobs,
      tasks,
      customers,
      photos,
      syncQueue,
      totalSize
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService()