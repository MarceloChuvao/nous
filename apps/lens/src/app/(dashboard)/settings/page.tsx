'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Account */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Account</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Name</label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <Button variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-600">Receive updates via email</p>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Agent Alerts</p>
                <p className="text-xs text-gray-600">Get notified when agents detect important changes</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
