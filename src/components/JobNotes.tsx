'use client'

import { useState } from 'react'
import { MessageSquare, Send, User, Clock, AlertTriangle, CheckCircle, Camera } from 'lucide-react'

interface Note {
  id: string
  author: string
  message: string
  createdAt: string
  type: 'note' | 'update' | 'issue' | 'completion'
  photos?: string[]
  internal?: boolean
}

interface JobNotesProps {
  jobId: string
}

// Mock notes data
const mockNotes: Note[] = [
  {
    id: '1',
    author: 'Mike Johnson',
    message: 'Started electrical panel replacement. Old panel was more corroded than expected - will need extra time for safe removal.',
    createdAt: '2026-02-12T09:15:00Z',
    type: 'update',
  },
  {
    id: '2',
    author: 'Mike Johnson',
    message: 'Found code violation with existing wiring behind the stove. Customer has been notified - this will require additional work.',
    createdAt: '2026-02-14T16:30:00Z',
    type: 'issue',
    photos: ['safety-issue.jpg'],
  },
  {
    id: '3',
    author: 'Sarah Chen',
    message: 'Customer approved the additional work for code compliance. Updated timeline reflects the change.',
    createdAt: '2026-02-14T18:45:00Z',
    type: 'note',
    internal: false,
  },
  {
    id: '4',
    author: 'Mike Johnson',
    message: 'New panel installed and energized. All circuits tested and working properly. Moving on to outlet installations tomorrow.',
    createdAt: '2026-02-14T17:30:00Z',
    type: 'completion',
    photos: ['panel-complete.jpg'],
  },
  {
    id: '5',
    author: 'Mike Johnson',
    message: 'Need to coordinate with restaurant manager for tomorrow\'s work - they have a lunch rush from 12-2pm.',
    createdAt: '2026-02-15T08:00:00Z',
    type: 'note',
    internal: true,
  },
]

const noteTypeStyles = {
  'note': { bg: 'bg-gray-50', icon: MessageSquare, iconColor: 'text-gray-500' },
  'update': { bg: 'bg-blue-50', icon: Clock, iconColor: 'text-blue-500' },
  'issue': { bg: 'bg-red-50', icon: AlertTriangle, iconColor: 'text-red-500' },
  'completion': { bg: 'bg-green-50', icon: CheckCircle, iconColor: 'text-green-500' },
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ` (${diffInHours}h ago)`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

export function JobNotes({ jobId }: JobNotesProps) {
  const [notes] = useState<Note[]>(mockNotes.reverse()) // Show newest first
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<Note['type']>('note')
  const [isInternal, setIsInternal] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    
    // In real app, this would save to database
    console.log('Adding note:', {
      message: newNote,
      type: noteType,
      internal: isInternal,
    })
    
    setNewNote('')
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Job Notes & Updates</h3>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {notes.length} notes
          </span>
        </div>
      </div>

      {/* Add New Note */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as Note['type'])}
              className="rounded-md border-gray-300 text-sm"
            >
              <option value="note">General Note</option>
              <option value="update">Progress Update</option>
              <option value="issue">Issue/Problem</option>
              <option value="completion">Task Completed</option>
            </select>
            
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-gray-300 mr-2"
              />
              Internal only
            </label>
          </div>
          
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">MJ</span>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note, update, or observation..."
                className="w-full rounded-md border-gray-300 text-sm resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Attach Photos
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Notes List */}
      <div className="p-6">
        <div className="space-y-6">
          {notes.map((note) => {
            const typeConfig = noteTypeStyles[note.type]
            const IconComponent = typeConfig.icon
            
            return (
              <div key={note.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${typeConfig.bg}`}>
                    <IconComponent className={`h-4 w-4 ${typeConfig.iconColor}`} />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{note.author}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        note.type === 'issue' ? 'bg-red-100 text-red-800' :
                        note.type === 'completion' ? 'bg-green-100 text-green-800' :
                        note.type === 'update' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {note.type}
                      </span>
                      {note.internal && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDateTime(note.createdAt)}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{note.message}</p>
                  
                  {note.photos && note.photos.length > 0 && (
                    <div className="flex space-x-2">
                      {note.photos.map((photo, index) => (
                        <div 
                          key={index}
                          className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-300"
                        >
                          <Camera className="h-6 w-6 text-gray-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-sm text-gray-500">
              Start documenting progress and important updates for this job
            </p>
          </div>
        )}
      </div>
    </div>
  )
}