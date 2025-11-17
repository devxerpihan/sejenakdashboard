'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Completing sign in...
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we complete your authentication.
          </p>
        </div>
        
        {/* This component handles the OAuth callback automatically */}
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  )
}