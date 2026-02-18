'use client'

import { WifiOff, RefreshCw, Camera, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="h-8 w-8 text-gray-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          Don't worry! FieldForge works offline. You can still access your jobs, 
          take photos, and update tasks. Everything will sync when you're back online.
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Camera className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800">Photo capture available</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-blue-800">Job data accessible</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-purple-800">Auto-sync when online</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            onClick={() => window.history.back()} 
            variant="outline" 
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            FieldForge PWA • Offline Ready
          </p>
        </div>
      </div>
    </div>
  )
}