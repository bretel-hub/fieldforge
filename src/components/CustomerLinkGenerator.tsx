'use client'

import { useState } from 'react'
import { Copy, Mail, ExternalLink, Check } from 'lucide-react'

// Mock customer data
const mockCustomers = [
  {
    id: 'abc-manufacturing',
    name: 'ABC Manufacturing',
    contact: 'John Smith',
    email: 'john@abc-manufacturing.com',
    hasActiveProposals: true,
    hasActiveJobs: false,
  },
  {
    id: 'riverside-restaurant',
    name: 'Riverside Restaurant',
    contact: 'Maria Rodriguez',
    email: 'maria@riverside-restaurant.com',
    hasActiveProposals: true,
    hasActiveJobs: true,
  },
  {
    id: 'office-park-building-a',
    name: 'Office Park Building A',
    contact: 'David Chen',
    email: 'david@officepark.com',
    hasActiveProposals: true,
    hasActiveJobs: true,
  },
  {
    id: 'metro-health-clinic',
    name: 'Metro Health Clinic',
    contact: 'Jennifer Kim',
    email: 'jennifer@metrohealth.com',
    hasActiveProposals: true,
    hasActiveJobs: false,
  },
]

export function CustomerLinkGenerator() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')

  const generatePortalUrl = (customerId: string) => {
    // In production, this would be your actual domain
    const baseUrl = 'https://portal.fieldforge.com'
    return `${baseUrl}/customer/${customerId}/portal`
  }

  const copyToClipboard = async (text: string, customerId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(customerId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const generateEmailTemplate = (customer: any) => {
    const portalUrl = generatePortalUrl(customer.id)
    
    return `Subject: Your FieldForge Customer Portal Access

Hi ${customer.contact},

Your personalized project portal is now available! You can view your proposals, track job progress, and see real-time photo updates from our team.

Access your portal here:
${portalUrl}

What you can do in your portal:
• Review and approve proposals
• Track active project progress
• View before/during/after photos
• Contact your project team directly
• Download project documents

This link is secure and personalized for ${customer.name}. No password required.

Questions? Reply to this email or call us at (555) 123-4567.

Best regards,
The FieldForge Team`
  }

  const selectedCustomerData = mockCustomers.find(c => c.id === selectedCustomer)

  return (
    <div className="space-y-8">
      {/* Customer Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Customer</h3>
        
        <div className="space-y-3">
          {mockCustomers.map((customer) => (
            <div 
              key={customer.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedCustomer === customer.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedCustomer(customer.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.contact} • {customer.email}</p>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex space-x-4">
                    {customer.hasActiveProposals && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Proposals
                      </span>
                    )}
                    {customer.hasActiveJobs && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Active Jobs
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link Generation */}
      {selectedCustomerData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Portal Link for {selectedCustomerData.name}
          </h3>
          
          <div className="space-y-4">
            {/* Portal URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Portal URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={generatePortalUrl(selectedCustomerData.id)}
                  readOnly
                  className="flex-1 rounded-l-md border-gray-300 bg-gray-50 text-gray-900 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(generatePortalUrl(selectedCustomerData.id), selectedCustomerData.id)}
                  className="px-3 py-2 border-l-0 border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 text-gray-700"
                >
                  {copiedId === selectedCustomerData.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <a
                href={generatePortalUrl(selectedCustomerData.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview Portal
              </a>
              
              <button
                onClick={() => {
                  const emailBody = generateEmailTemplate(selectedCustomerData)
                  const mailtoUrl = `mailto:${selectedCustomerData.email}?${new URLSearchParams({
                    subject: 'Your FieldForge Customer Portal Access',
                    body: emailBody
                  })}`
                  window.location.href = mailtoUrl
                }}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Template Preview */}
      {selectedCustomerData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Template</h3>
          
          <div className="bg-gray-50 border rounded-lg p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {generateEmailTemplate(selectedCustomerData)}
            </pre>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => copyToClipboard(generateEmailTemplate(selectedCustomerData), `email-${selectedCustomerData.id}`)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {copiedId === `email-${selectedCustomerData.id}` ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Email Text
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-medium text-blue-800 mb-2">How Customer Portal Links Work</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Each customer gets a unique portal URL based on their company name</li>
          <li>• No login required - the URL itself provides access</li>
          <li>• Customers only see their own proposals and jobs</li>
          <li>• Internal photos and notes are filtered out</li>
          <li>• Links work on mobile and desktop devices</li>
          <li>• For production, consider adding token-based security</li>
        </ul>
      </div>
    </div>
  )
}