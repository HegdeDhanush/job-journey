import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { EnhancedPlacementList } from '@/components/placements/EnhancedPlacementList'
import { PlacementForm } from '@/components/placements/PlacementForm'
import { AIFollowUpParser } from '@/components/placements/AIFollowUpParser'
import { supabase, type Placement } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const Index = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'follow-up'>('list')
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
      setSupabaseConfigured(false)
      setIsLoading(false)
      return
    }

    // Check initial auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuthSuccess = () => {
    // User state will be updated automatically by the auth listener
  }

  const handleAddPlacement = () => {
    setSelectedPlacement(null)
    setCurrentView('add')
  }

  const handleEditPlacement = (placement: Placement) => {
    setSelectedPlacement(placement)
    setCurrentView('edit')
  }

  const handleFollowUpParser = () => {
    setCurrentView('follow-up')
  }

  const handleFormSuccess = () => {
    setCurrentView('list')
    setSelectedPlacement(null)
  }

  const handleFormCancel = () => {
    setCurrentView('list')
    setSelectedPlacement(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Configuration Required</h1>
          <p className="text-muted-foreground mb-4">
            This application requires Supabase configuration to work properly.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Create a <code className="bg-background px-1 rounded">.env</code> file in the project root</li>
              <li>Add your Supabase URL and API key:</li>
            </ol>
            <pre className="bg-background p-2 rounded mt-2 text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key`}
            </pre>
            <p className="mt-2 text-xs text-muted-foreground">
              You can get these values from your Supabase project dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <DashboardLayout>
      {currentView === 'list' && (
        <EnhancedPlacementList
          onAddPlacement={handleAddPlacement}
          onEditPlacement={handleEditPlacement}
          onFollowUpParser={handleFollowUpParser}
        />
      )}
      {(currentView === 'add' || currentView === 'edit') && (
        <PlacementForm
          placement={selectedPlacement}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
      {currentView === 'follow-up' && (
        <AIFollowUpParser
          onUpdateComplete={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </DashboardLayout>
  )
};

export default Index;
