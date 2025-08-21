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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  PieChart,
  Download,
  Eye,
  EyeOff,
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
  ArrowUpDown
} from 'lucide-react'

interface PlacementListProps {
  onAddPlacement: () => void
  onEditPlacement: (placement: Placement) => void
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

export const PlacementList = ({ onAddPlacement, onEditPlacement }: PlacementListProps) => {
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

  const getEligibilityBadge = (eligible: boolean | null) => {
    if (eligible === null) return <Badge variant="outline">Not Sure</Badge>
    return eligible ? 
      <Badge className="bg-green-100 text-green-800">Eligible</Badge> : 
      <Badge variant="destructive">Not Eligible</Badge>
  }

  const getStatsCards = () => {
    const total = placements.length
    const applied = placements.filter(p => p.status === 'Applied').length
    const inProgress = placements.filter(p => p.status === 'In Progress').length
    const selected = placements.filter(p => p.status === 'Selected').length
    const rejected = placements.filter(p => p.status === 'Rejected').length
    const withdrawn = placements.filter(p => p.status === 'Withdrawn').length

    const avgCtc = placements
      .filter(p => p.ctc)
      .reduce((sum, p) => sum + (p.ctc || 0), 0) / 
      placements.filter(p => p.ctc).length || 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
            <p className="text-xs text-muted-foreground">Active applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selected}</div>
            <p className="text-xs text-muted-foreground">Offers received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CTC</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCtc.toFixed(1)} LPA</div>
            <p className="text-xs text-muted-foreground">Average package</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTableView = () => (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedPlacements.length === filteredPlacements.length && filteredPlacements.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CTC</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlacements.map((placement) => (
              <TableRow key={placement.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedPlacements.includes(placement.id)}
                    onCheckedChange={() => toggleSelection(placement.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{placement.company_name}</TableCell>
                <TableCell>{placement.role || '-'}</TableCell>
                <TableCell>{getStatusBadge(placement)}</TableCell>
                <TableCell>{placement.ctc ? `${placement.ctc} LPA` : '-'}</TableCell>
                <TableCell>{placement.location || '-'}</TableCell>
                <TableCell>
                  {placement.registration_deadline ? (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(placement.registration_deadline).toLocaleDateString()}</span>
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditPlacement(placement)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(placement.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredPlacements.map((placement) => (
        <Card key={placement.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{placement.company_name}</CardTitle>
                <CardDescription>{placement.role || 'No role specified'}</CardDescription>
              </div>
              <Checkbox 
                checked={selectedPlacements.includes(placement.id)}
                onCheckedChange={() => toggleSelection(placement.id)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(placement)}
            </div>
            {placement.ctc && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">CTC</span>
                <span className="font-medium">{placement.ctc} LPA</span>
              </div>
            )}
            {placement.location && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{placement.location}</span>
                </div>
              </div>
            )}
            {placement.registration_deadline && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deadline</span>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(placement.registration_deadline).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditPlacement(placement)}
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDelete(placement.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Delete
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{status}</h3>
                <Badge variant="secondary">{statusPlacements.length}</Badge>
              </div>
              <div className="space-y-2">
                {statusPlacements.map((placement) => (
                  <Card key={placement.id} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{placement.company_name}</h4>
                        <Checkbox 
                          checked={selectedPlacements.includes(placement.id)}
                          onCheckedChange={() => toggleSelection(placement.id)}
                        />
                      </div>
                      {placement.role && (
                        <p className="text-xs text-muted-foreground">{placement.role}</p>
                      )}
                      {placement.ctc && (
                        <p className="text-xs font-medium">{placement.ctc} LPA</p>
                      )}
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditPlacement(placement)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(placement.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
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
      {getStatsCards()}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button onClick={onAddPlacement}>
            <Plus className="mr-2 h-4 w-4" />
            Add Placement
          </Button>
          {selectedPlacements.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedPlacements.length})
            </Button>
          )}
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
                  value={filters.hasDeadline === null ? '' : filters.hasDeadline.toString()}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    hasDeadline: value === '' ? null : value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Has Interview</Label>
                <Select
                  value={filters.hasInterview === null ? '' : filters.hasInterview.toString()}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    hasInterview: value === '' ? null : value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Has Test</Label>
                <Select
                  value={filters.hasTest === null ? '' : filters.hasTest.toString()}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    hasTest: value === '' ? null : value === 'true'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
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