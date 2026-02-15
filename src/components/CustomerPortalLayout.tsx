'use client'

import { ReactNode } from 'react'
import { Building2, Mail, Phone } from 'lucide-react'

interface Customer {
  id: string
  name: string
  contact: string
  email: string
}

interface CustomerPortalLayoutProps {
  children: ReactNode
  customer: Customer
}

export function CustomerPortalLayout({ children, customer }: CustomerPortalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FF</span>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-gray-900">FieldForge</h1>
                <p className="text-sm text-gray-600">Customer Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                {customer.name}
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FF</span>
              </div>
              <span className="ml-2 text-gray-600">FieldForge</span>
            </div>
            
            <div className="text-sm text-gray-500">
              Questions? Contact us at{' '}
              <a href="mailto:support@fieldforge.com" className="text-blue-600 hover:text-blue-500">
                support@fieldforge.com
              </a>
              {' '}or{' '}
              <a href="tel:+15551234567" className="text-blue-600 hover:text-blue-500">
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}