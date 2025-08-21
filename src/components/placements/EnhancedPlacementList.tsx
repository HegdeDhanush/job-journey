import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { supabase, type Placement } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search, 
  Plus, 
  Building2,
  Calendar,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Grid3X3,
  List,
  BarChart3,
  SortAsc,
  SortDesc,
  Target,
  Clock,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react'

interface PlacementListProps {
  onAddPlacement: () => void
  onEditPlacement: (placement: Placement) => void
  onFollowUpParser: () => void
}

type ViewMode = 'table' | 'grid' | 'kanban'
type SortField = 'company_name' | 'status' | 'ctc' | 'created_at' | 'registration_deadline'
type SortOrder = 'asc' | 'desc'

interface FilterState {
  status: string[]
  ctcRange: { min: number | null; max: number | null }
  dateRange: { start: string; end: string }
  location: string[]
  hasDeadline: boolean | null
  hasInterview: boolean | null
  hasTest: boolean | null
}

export const EnhancedPlacementList = ({ onAddPlacement, onEditPlacement, onFollowUpParser }: PlacementListProps) => {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [filteredPlacements, setFilteredPlacements] = useState<Placement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    ctcRange: { min: null, max: null },
    dateRange: { start: '', end: '' },
    location: [],
    hasDeadline: null,
    hasInterview: null,
    hasTest: null,
  })
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchPlacements()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [placements, searchTerm, filters, sortField, sortOrder])

  const applyFiltersAndSort = () => {
    let filtered = placements.filter(placement => {
      // Search filter
      const matchesSearch = 
        placement.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        placement.location?.toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchesSearch) return false

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(placement.status)) {
        return false
      }

      // CTC range filter
      if (filters.ctcRange.min !== null && placement.ctc && placement.ctc < filters.ctcRange.min) {
        return false
      }
      if (filters.ctcRange.max !== null && placement.ctc && placement.ctc > filters.ctcRange.max) {
        return false
      }

      // Date range filter
      if (filters.dateRange.start && placement.registration_deadline) {
        const deadline = new Date(placement.registration_deadline)
        const startDate = new Date(filters.dateRange.start)
        if (deadline < startDate) return false
      }
      if (filters.dateRange.end && placement.registration_deadline) {
        const deadline = new Date(placement.registration_deadline)
        const endDate = new Date(filters.dateRange.end)
        if (deadline > endDate) return false
      }

      // Location filter
      if (filters.location.length > 0 && placement.location && !filters.location.includes(placement.location)) {
        return false
      }

      // Has deadline filter
      if (filters.hasDeadline !== null) {
        const hasDeadline = !!placement.registration_deadline
        if (hasDeadline !== filters.hasDeadline) return false
      }

      // Has interview filter
      if (filters.hasInterview !== null) {
        const hasInterview = !!(placement.interview_1 || placement.interview_2 || placement.interview_3)
        if (hasInterview !== filters.hasInterview) return false
      }

      // Has test filter
      if (filters.hasTest !== null) {
        const hasTest = !!(placement.test_1 || placement.test_2 || placement.test_3 || placement.test_4 || placement.test_5)
        if (hasTest !== filters.hasTest) return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'created_at' || sortField === 'registration_deadline') {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredPlacements(filtered)
  }

  const fetchPlacements = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('placements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPlacements(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch placements",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (placementId: string) => {
    try {
      const { error } = await supabase
        .from('placements')
        .delete()
        .eq('id', placementId)

      if (error) throw error

      toast({
        title: "Placement deleted",
        description: "The placement record has been deleted successfully.",
      })
      
      fetchPlacements()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete placement",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPlacements.length === 0) return

    try {
      const { error } = await supabase
        .from('placements')
        .delete()
        .in('id', selectedPlacements)

      if (error) throw error

      toast({
        title: "Placements deleted",
        description: `${selectedPlacements.length} placement(s) have been deleted successfully.`,
      })
      
      setSelectedPlacements([])
      fetchPlacements()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete placements",
        variant: "destructive",
      })
    }
  }

  const toggleSelection = (placementId: string) => {
    setSelectedPlacements(prev => 
      prev.includes(placementId) 
        ? prev.filter(id => id !== placementId)
        : [...prev, placementId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedPlacements.length === filteredPlacements.length) {
      setSelectedPlacements([])
    } else {
      setSelectedPlacements(filteredPlacements.map(p => p.id))
    }
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      ctcRange: { min: null, max: null },
      dateRange: { start: '', end: '' },
      location: [],
      hasDeadline: null,
      hasInterview: null,
      hasTest: null,
    })
    setSearchTerm('')
  }

  const getStatusBadge = (placement: Placement) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'Applied': 'default',
      'In Progress': 'secondary',
      'Selected': 'default',
      'Rejected': 'destructive',
      'Withdrawn': 'outline',
      'Not Eligible': 'outline',
    }
    
    // Check if placement is not eligible but has a status other than "Applied" or "Not Eligible"
    const isIneligibleWithWrongStatus = placement.are_you_eligible === false && 
      placement.status !== 'Applied' && placement.status !== 'Not Eligible'
    
    return (
      <div className="flex items-center gap-1">
        <Badge variant={variants[placement.status] || 'default'}>{placement.status}</Badge>
        {isIneligibleWithWrongStatus && (
          <AlertCircle className="h-3 w-3 text-yellow-600" />
        )}
      </div>
    )
  }

  const renderTableView = () => (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Upcoming Test/Interview</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead className="w-12">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlacements.map((placement) => (
              <TableRow key={placement.id}>
                <TableCell className="font-medium">{placement.company_name}</TableCell>
                <TableCell>{getStatusBadge(placement)}</TableCell>
                <TableCell>
                  {getUpcomingEvents(placement)}
                </TableCell>
                <TableCell>
                  {getEligibilityStatus(placement)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditPlacement(placement)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  const getUpcomingEvents = (placement: Placement) => {
    // Check if user is eligible and status is not rejected/withdrawn
    if (placement.are_you_eligible !== true || placement.status === 'Rejected' || placement.status === 'Withdrawn') {
      return <span className="text-muted-foreground">No upcoming events</span>
    }

    const events = []
    
    // Check for upcoming tests
    for (let i = 1; i <= 5; i++) {
      const testDate = placement[`test_${i}_date` as keyof Placement] as string
      const testDesc = placement[`test_${i}` as keyof Placement] as string
      if (testDate && testDesc) {
        const date = new Date(testDate)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && diffDays <= 7) {
          events.push({
            type: 'Test',
            description: testDesc,
            date: testDate,
            daysLeft: diffDays
          })
        }
      }
    }
    
    // Check for upcoming interviews
    for (let i = 1; i <= 3; i++) {
      const interviewDate = placement[`interview_${i}_date` as keyof Placement] as string
      const interviewDesc = placement[`interview_${i}` as keyof Placement] as string
      if (interviewDate && interviewDesc) {
        const date = new Date(interviewDate)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && diffDays <= 7) {
          events.push({
            type: 'Interview',
            description: interviewDesc,
            date: interviewDate,
            daysLeft: diffDays
          })
        }
      }
    }
    
    if (events.length === 0) {
      return <span className="text-muted-foreground">No upcoming events</span>
    }
    
    // Sort by date and show the closest one
    events.sort((a, b) => a.daysLeft - b.daysLeft)
    const nextEvent = events[0]
    
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-xs">
          {nextEvent.type}
        </Badge>
        <span className="text-sm">{nextEvent.description}</span>
        <span className="text-xs text-muted-foreground">
          {nextEvent.daysLeft === 0 ? 'Today' : `${nextEvent.daysLeft} day${nextEvent.daysLeft > 1 ? 's' : ''}`}
        </span>
      </div>
    )
  }

  const getEligibilityStatus = (placement: Placement) => {
    if (placement.are_you_eligible === null) {
      return <Badge variant="outline">Not Sure</Badge>
    }
    
    if (placement.are_you_eligible) {
      return <Badge className="bg-green-100 text-green-800">Eligible</Badge>
    }
    
    return <Badge variant="destructive">Not Eligible</Badge>
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPlacements.map((placement) => (
        <Card key={placement.id} className="relative hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{placement.company_name}</CardTitle>
                <CardDescription>{placement.role || 'No role specified'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(placement)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Eligibility</span>
              {getEligibilityStatus(placement)}
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Next Event</span>
              </div>
              {getUpcomingEvents(placement)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditPlacement(placement)}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderKanbanView = () => {
    const statuses = ['Applied', 'In Progress', 'Selected', 'Rejected', 'Withdrawn', 'Not Eligible']
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statuses.map((status) => {
          const statusPlacements = filteredPlacements.filter(p => p.status === status)
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <h3 className="font-semibold">{status}</h3>
                <Badge variant="secondary">{statusPlacements.length}</Badge>
              </div>
              <div className="space-y-2">
                {statusPlacements.map((placement) => (
                  <Card key={placement.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{placement.company_name}</h4>
                      </div>
                      {placement.role && (
                        <p className="text-xs text-muted-foreground">{placement.role}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Eligibility:</span>
                        {getEligibilityStatus(placement)}
                      </div>
                      <div className="text-xs">
                        {getUpcomingEvents(placement)}
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditPlacement(placement)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const getProgressIndicator = (placement: Placement) => {
    const hasTests = !!(placement.test_1 || placement.test_2 || placement.test_3 || placement.test_4 || placement.test_5)
    const hasInterviews = !!(placement.interview_1 || placement.interview_2 || placement.interview_3)
    
    if (placement.status === 'Selected') return <Badge className="bg-green-100 text-green-800">Complete</Badge>
    if (placement.status === 'Rejected') return <Badge variant="destructive">Rejected</Badge>
    if (placement.status === 'Withdrawn') return <Badge variant="outline">Withdrawn</Badge>
    
    if (hasInterviews) return <Badge className="bg-blue-100 text-blue-800">Interview Stage</Badge>
    if (hasTests) return <Badge className="bg-yellow-100 text-yellow-800">Test Stage</Badge>
    return <Badge variant="secondary">Applied</Badge>
  }

  const getProgressPercentage = (placement: Placement) => {
    if (placement.status === 'Selected') return 100
    if (placement.status === 'Rejected' || placement.status === 'Withdrawn') return 0
    
    let progress = 20 // Applied
    if (placement.test_1 || placement.test_2 || placement.test_3 || placement.test_4 || placement.test_5) progress += 30
    if (placement.interview_1 || placement.interview_2 || placement.interview_3) progress += 50
    
    return Math.min(progress, 90)
  }

  const getAdvancedStats = () => {
    const totalCompanies = placements.length
    const eligibleCompanies = placements.filter(p => p.are_you_eligible === true).length
    const upcomingEvents = getUpcomingEventsList()

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <p className="text-xs text-muted-foreground">Companies applied to</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Companies</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibleCompanies}</div>
            <p className="text-xs text-muted-foreground">Companies you're eligible for</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Tests/Interviews (eligible & active)</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusDistribution = () => {
    const statuses = ['Applied', 'In Progress', 'Selected', 'Rejected', 'Withdrawn', 'Not Eligible']
    const total = placements.length
    
    return statuses.map(status => {
      const count = placements.filter(p => p.status === status).length
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0
      
      const colors = {
        'Applied': '#3B82F6', // Blue
        'In Progress': '#F59E0B', // Amber
        'Selected': '#10B981', // Green
        'Rejected': '#EF4444', // Red
        'Withdrawn': '#6B7280', // Gray
        'Not Eligible': '#DC2626' // Red
      }
      
      return {
        name: status,
        count,
        percentage,
        color: colors[status as keyof typeof colors]
      }
    }).filter(item => item.count > 0)
  }

  const getEligibilityDistribution = () => {
    const eligible = placements.filter(p => p.are_you_eligible === true).length
    const notEligible = placements.filter(p => p.are_you_eligible === false).length
    const notSure = placements.filter(p => p.are_you_eligible === null).length
    
    return [
      { name: 'Eligible', count: eligible },
      { name: 'Not Eligible', count: notEligible },
      { name: 'Not Sure', count: notSure }
    ]
  }

  const getProgressMetrics = () => {
    const total = placements.length
    const selected = placements.filter(p => p.status === 'Selected').length
    const inProgress = placements.filter(p => p.status === 'In Progress').length
    const hasTests = placements.filter(p => 
      p.test_1 || p.test_2 || p.test_3 || p.test_4 || p.test_5
    ).length
    const hasInterviews = placements.filter(p => 
      p.interview_1 || p.interview_2 || p.interview_3
    ).length
    
    return [
      {
        name: 'Success Rate',
        value: `${selected}/${total}`,
        percentage: total > 0 ? Math.round((selected / total) * 100) : 0,
        color: '#10B981' // Green
      },
      {
        name: 'In Progress',
        value: `${inProgress}/${total}`,
        percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0,
        color: '#F59E0B' // Amber
      },
      {
        name: 'With Tests',
        value: `${hasTests}/${total}`,
        percentage: total > 0 ? Math.round((hasTests / total) * 100) : 0,
        color: '#3B82F6' // Blue
      },
      {
        name: 'With Interviews',
        value: `${hasInterviews}/${total}`,
        percentage: total > 0 ? Math.round((hasInterviews / total) * 100) : 0,
        color: '#8B5CF6' // Purple
      }
    ]
  }

  const getUpcomingEventsList = () => {
    const events = []
    
    placements.forEach(placement => {
      // Check if user is eligible and status is not rejected/withdrawn
      if (placement.are_you_eligible !== true || placement.status === 'Rejected' || placement.status === 'Withdrawn') {
        return // Skip this placement
      }

      // Check for upcoming tests
      for (let i = 1; i <= 5; i++) {
        const testDate = placement[`test_${i}_date` as keyof Placement] as string
        const testDesc = placement[`test_${i}` as keyof Placement] as string
        if (testDate && testDesc) {
          const date = new Date(testDate)
          const now = new Date()
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays >= 0 && diffDays <= 7) {
            events.push({
              company: placement.company_name,
              type: 'Test',
              description: testDesc,
              date: testDate,
              daysLeft: diffDays
            })
          }
        }
      }
      
      // Check for upcoming interviews
      for (let i = 1; i <= 3; i++) {
        const interviewDate = placement[`interview_${i}_date` as keyof Placement] as string
        const interviewDesc = placement[`interview_${i}` as keyof Placement] as string
        if (interviewDate && interviewDesc) {
          const date = new Date(interviewDate)
          const now = new Date()
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays >= 0 && diffDays <= 7) {
            events.push({
              company: placement.company_name,
              type: 'Interview',
              description: interviewDesc,
              date: interviewDate,
              daysLeft: diffDays
            })
          }
        }
      }
    })
    
    // Sort by date and return top 5
    events.sort((a, b) => a.daysLeft - b.daysLeft)
    return events.slice(0, 5)
  }

  const calculateAvgResponseTime = () => {
    const placementsWithDates = placements.filter(p => p.created_at && p.status !== 'Applied')
    if (placementsWithDates.length === 0) return 'N/A'
    
    const totalDays = placementsWithDates.reduce((sum, p) => {
      const created = new Date(p.created_at)
      const now = new Date()
      return sum + Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    }, 0)
    
    return Math.round(totalDays / placementsWithDates.length)
  }

  const exportToExcel = (exportFiltered: boolean = false) => {
    try {
      const dataToExport = exportFiltered ? filteredPlacements : placements
      
      // Prepare data for Excel
      const excelData = dataToExport.map(placement => ({
        'Company Name': placement.company_name,
        'Role': placement.role || '',
        'Status': placement.status,
        'CTC (LPA)': placement.ctc || '',
        'Location': placement.location || '',
        'Registration Deadline': placement.registration_deadline ? new Date(placement.registration_deadline).toLocaleDateString() : '',
        'Eligibility': placement.are_you_eligible === true ? 'Yes' : placement.are_you_eligible === false ? 'No' : 'Not Sure',
        'Test 1': placement.test_1 || '',
        'Test 1 Date': placement.test_1_date ? new Date(placement.test_1_date).toLocaleDateString() : '',
        'Test 1 Result': placement.result_1 || '',
        'Test 2': placement.test_2 || '',
        'Test 2 Date': placement.test_2_date ? new Date(placement.test_2_date).toLocaleDateString() : '',
        'Test 2 Result': placement.result_2 || '',
        'Test 3': placement.test_3 || '',
        'Test 3 Date': placement.test_3_date ? new Date(placement.test_3_date).toLocaleDateString() : '',
        'Test 3 Result': placement.result_3 || '',
        'Test 4': placement.test_4 || '',
        'Test 4 Date': placement.test_4_date ? new Date(placement.test_4_date).toLocaleDateString() : '',
        'Test 4 Result': placement.result_4 || '',
        'Test 5': placement.test_5 || '',
        'Test 5 Date': placement.test_5_date ? new Date(placement.test_5_date).toLocaleDateString() : '',
        'Test 5 Result': placement.result_5 || '',
        'Interview 1': placement.interview_1 || '',
        'Interview 1 Date': placement.interview_1_date ? new Date(placement.interview_1_date).toLocaleDateString() : '',
        'Interview 1 Result': placement.interview_result_1 || '',
        'Interview 2': placement.interview_2 || '',
        'Interview 2 Date': placement.interview_2_date ? new Date(placement.interview_2_date).toLocaleDateString() : '',
        'Interview 2 Result': placement.interview_result_2 || '',
        'Interview 3': placement.interview_3 || '',
        'Interview 3 Date': placement.interview_3_date ? new Date(placement.interview_3_date).toLocaleDateString() : '',
        'Interview 3 Result': placement.interview_result_3 || '',
        'Created At': new Date(placement.created_at).toLocaleDateString(),
      }))

      // Convert to CSV
      const headers = Object.keys(excelData[0])
      const csvContent = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(',')
        )
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `placements_${exportFiltered ? 'filtered' : 'complete'}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: `${dataToExport.length} placements exported to CSV file.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export placements. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading placements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {getAdvancedStats()}
      
      {/* Upcoming Events Section */}
      {getUpcomingEventsList().length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events - Left Half */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Upcoming Tests & Interviews (Eligible & Active)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getUpcomingEventsList().map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{event.company}</p>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {event.daysLeft === 0 ? 'Today' : `${event.daysLeft} day${event.daysLeft > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Pie Chart - Right Half */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Application Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status Distribution Pie Chart */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Application Status Distribution</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {getStatusDistribution().map((status) => (
                      <div key={status.name} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{status.name}</p>
                          <p className="text-xs text-muted-foreground">{status.count} applications</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{status.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligibility Distribution */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Eligibility Overview</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {getEligibilityDistribution().map((item) => (
                      <div key={item.name} className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{item.count}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Metrics */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Progress Metrics</h4>
                  <div className="space-y-3">
                    {getProgressMetrics().map((metric) => (
                      <div key={metric.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.name}</span>
                          <span className="font-medium">{metric.value}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${metric.percentage}%`,
                              backgroundColor: metric.color 
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={onAddPlacement}>
            <Plus className="mr-2 h-4 w-4" />
            Add Placement
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportToExcel(false)}>
                <Download className="mr-2 h-4 w-4" />
                Export Complete List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToExcel(true)}>
                <Filter className="mr-2 h-4 w-4" />
                Export Filtered List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={onFollowUpParser}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Follow-Up Parser
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setSortField('company_name'); setSortOrder('asc') }}>
                Company Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('company_name'); setSortOrder('desc') }}>
                Company Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('ctc'); setSortOrder('desc') }}>
                CTC (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('ctc'); setSortOrder('asc') }}>
                CTC (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('created_at'); setSortOrder('desc') }}>
                Date Added (Newest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortField('created_at'); setSortOrder('asc') }}>
                Date Added (Oldest)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {viewMode === 'table' && <List className="mr-2 h-4 w-4" />}
                {viewMode === 'grid' && <Grid3X3 className="mr-2 h-4 w-4" />}
                {viewMode === 'kanban' && <BarChart3 className="mr-2 h-4 w-4" />}
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setViewMode('table')}>
                <List className="mr-2 h-4 w-4" />
                Table View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('grid')}>
                <Grid3X3 className="mr-2 h-4 w-4" />
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('kanban')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Kanban View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Advanced Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-2">
                  {['Applied', 'In Progress', 'Selected', 'Rejected', 'Withdrawn', 'Not Eligible'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filters.status.includes(status)}
                        onCheckedChange={(checked) => {
                          setFilters(prev => ({
                            ...prev,
                            status: checked 
                              ? [...prev.status, status]
                              : prev.status.filter(s => s !== status)
                          }))
                        }}
                      />
                      <Label htmlFor={`status-${status}`} className="text-sm">{status}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>CTC Range (LPA)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.ctcRange.min || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      ctcRange: { ...prev.ctcRange, min: e.target.value ? Number(e.target.value) : null }
                    }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.ctcRange.max || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      ctcRange: { ...prev.ctcRange, max: e.target.value ? Number(e.target.value) : null }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Has Deadline</Label>
                <Select
                  value={filters.hasDeadline === null ? 'all' : filters.hasDeadline.toString()}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    hasDeadline: value === 'all' ? null : value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Has Interview</Label>
                <Select
                  value={filters.hasInterview === null ? 'all' : filters.hasInterview.toString()}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    hasInterview: value === 'all' ? null : value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Has Test</Label>
                <Select
                  value={filters.hasTest === null ? 'all' : filters.hasTest.toString()}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    hasTest: value === 'all' ? null : value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies, roles, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-sm text-muted-foreground">
          {filteredPlacements.length} of {placements.length} placements
        </span>
      </div>

      {viewMode === 'table' && renderTableView()}
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'kanban' && renderKanbanView()}

      {filteredPlacements.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No placements found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v !== null && v !== '') 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first placement'
            }
          </p>
          {!searchTerm && Object.values(filters).every(v => Array.isArray(v) ? v.length === 0 : v === null || v === '') && (
            <Button onClick={onAddPlacement}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Placement
            </Button>
          )}
        </div>
      )}
    </div>
  )
} 