import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Settings, 
  LogOut, 
  Building2,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  Clock,
  Edit,
  Save,
  X,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [editForm, setEditForm] = useState({
    full_name: '',
    college: '',
    course: '',
    graduation_year: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    const initialTheme = savedTheme || 'dark'
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchProfile(user.id)
      }
    }
    getUser()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const { error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: userId,
                  email: userData.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              ])
            
            if (createError) {
              console.error('Error creating profile:', createError)
              return
            }
            
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()
            
            setProfile(newProfile)
            setEditForm({
              full_name: newProfile?.full_name || '',
              college: newProfile?.college || '',
              course: newProfile?.course || '',
              graduation_year: newProfile?.graduation_year?.toString() || ''
            })
            return
          }
        }
        throw error
      }
      
      setProfile(data)
      setEditForm({
        full_name: data.full_name || '',
        college: data.college || '',
        course: data.course || '',
        graduation_year: data.graduation_year?.toString() || ''
      })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          college: editForm.college,
          course: editForm.course,
          graduation_year: editForm.graduation_year ? parseInt(editForm.graduation_year) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({
        ...profile,
        ...editForm,
        graduation_year: editForm.graduation_year ? parseInt(editForm.graduation_year) : null
      })
      setIsEditing(false)

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      college: profile?.college || '',
      course: profile?.course || '',
      graduation_year: profile?.graduation_year?.toString() || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold">Job Journey Log</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {showProfile ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Profile</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Manage your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">College/University</label>
                        <input
                          type="text"
                          value={editForm.college}
                          onChange={(e) => setEditForm(prev => ({ ...prev, college: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Course</label>
                        <input
                          type="text"
                          value={editForm.course}
                          onChange={(e) => setEditForm(prev => ({ ...prev, course: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Graduation Year</label>
                        <input
                          type="number"
                          value={editForm.graduation_year}
                          onChange={(e) => setEditForm(prev => ({ ...prev, graduation_year: e.target.value }))}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm">{profile?.full_name || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm">{user?.email || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">College/University</label>
                        <p className="text-sm">{profile?.college || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Course</label>
                        <p className="text-sm">{profile?.course || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                        <p className="text-sm">{profile?.graduation_year || 'Not provided'}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                        <p className="text-sm">
                          {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not available'}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            {/* Welcome Message */}
            {profile && (
              <div className="mb-6">
                <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/20">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-foreground">
                          Welcome back, {profile.full_name || 'Student'}! 👋
                        </h1>
                        <p className="text-muted-foreground mt-1">
                          Ready to track your placement journey? Let's make your career dreams a reality!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {children}
          </div>
        )}
      </div>
    </div>
  )
}