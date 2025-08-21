import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { supabase, type Placement } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Building2, FileText, Users, Award, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { AIEmailParser } from './AIEmailParser'
import { AIFollowUpParser } from './AIFollowUpParser'

interface PlacementFormProps {
  placement?: Placement | null
  onSuccess: () => void
  onCancel: () => void
}

export const PlacementForm = ({ placement, onSuccess, onCancel }: PlacementFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentView, setCurrentView] = useState<'form' | 'ai-parser' | 'ai-follow-up-parser'>('form')
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    ctc: '',
    location: '',
    eligibility: '',
    registration_deadline: '',
    registration_deadline_time: '',
    registration_link: '',
    are_you_eligible: null as boolean | null,
    status: 'Applied' as 'Applied' | 'In Progress' | 'Selected' | 'Rejected' | 'Withdrawn' | 'Not Eligible',
    // Tests
    test_1: '',
    test_1_date: '',
    test_1_time: '',
    result_1: 'pending',
    test_2: '',
    test_2_date: '',
    test_2_time: '',
    result_2: 'pending',
    test_3: '',
    test_3_date: '',
    test_3_time: '',
    result_3: 'pending',
    test_4: '',
    test_4_date: '',
    test_4_time: '',
    result_4: 'pending',
    test_5: '',
    test_5_date: '',
    test_5_time: '',
    result_5: 'pending',
    // Interviews
    interview_1: '',
    interview_1_date: '',
    interview_1_time: '',
    interview_result_1: 'pending',
    interview_2: '',
    interview_2_date: '',
    interview_2_time: '',
    interview_result_2: 'pending',
    interview_3: '',
    interview_3_date: '',
    interview_3_time: '',
    interview_result_3: 'pending',
  })

  const { toast } = useToast()

  useEffect(() => {
    if (placement) {
      setFormData({
        company_name: placement.company_name || '',
        role: placement.role || '',
        ctc: placement.ctc?.toString() || '',
        location: placement.location || '',
        eligibility: placement.eligibility || '',
        registration_deadline: placement.registration_deadline || '',
        registration_deadline_time: placement.registration_deadline_time || '',
        registration_link: placement.registration_link || '',
        are_you_eligible: placement.are_you_eligible,
        status: placement.status,
        test_1: placement.test_1 || '',
        test_1_date: placement.test_1_date || '',
        test_1_time: placement.test_1_time || '',
        result_1: placement.result_1 || 'pending',
        test_2: placement.test_2 || '',
        test_2_date: placement.test_2_date || '',
        test_2_time: placement.test_2_time || '',
        result_2: placement.result_2 || 'pending',
        test_3: placement.test_3 || '',
        test_3_date: placement.test_3_date || '',
        test_3_time: placement.test_3_time || '',
        result_3: placement.result_3 || 'pending',
        test_4: placement.test_4 || '',
        test_4_date: placement.test_4_date || '',
        test_4_time: placement.test_4_time || '',
        result_4: placement.result_4 || 'pending',
        test_5: placement.test_5 || '',
        test_5_date: placement.test_5_date || '',
        test_5_time: placement.test_5_time || '',
        result_5: placement.result_5 || 'pending',
        interview_1: placement.interview_1 || '',
        interview_1_date: placement.interview_1_date || '',
        interview_1_time: placement.interview_1_time || '',
        interview_result_1: placement.interview_result_1 || 'pending',
        interview_2: placement.interview_2 || '',
        interview_2_date: placement.interview_2_date || '',
        interview_2_time: placement.interview_2_time || '',
        interview_result_2: placement.interview_result_2 || 'pending',
        interview_3: placement.interview_3 || '',
        interview_3_date: placement.interview_3_date || '',
        interview_3_time: placement.interview_3_time || '',
        interview_result_3: placement.interview_result_3 || 'pending',
      })
    }
  }, [placement])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Clean up the data before submission
      const cleanFormData = { ...formData }
      
      // Convert empty strings to null for date/time fields
      const dataToSubmit = {
        ...cleanFormData,
        ctc: cleanFormData.ctc ? parseFloat(cleanFormData.ctc) : null,
        user_id: user.id,
        // Convert empty date/time strings to null
        registration_deadline: cleanFormData.registration_deadline || null,
        registration_deadline_time: cleanFormData.registration_deadline_time || null,
        test_1_date: cleanFormData.test_1_date || null,
        test_1_time: cleanFormData.test_1_time || null,
        test_2_date: cleanFormData.test_2_date || null,
        test_2_time: cleanFormData.test_2_time || null,
        test_3_date: cleanFormData.test_3_date || null,
        test_3_time: cleanFormData.test_3_time || null,
        test_4_date: cleanFormData.test_4_date || null,
        test_4_time: cleanFormData.test_4_time || null,
        test_5_date: cleanFormData.test_5_date || null,
        test_5_time: cleanFormData.test_5_time || null,
        interview_1_date: cleanFormData.interview_1_date || null,
        interview_1_time: cleanFormData.interview_1_time || null,
        interview_2_date: cleanFormData.interview_2_date || null,
        interview_2_time: cleanFormData.interview_2_time || null,
        interview_3_date: cleanFormData.interview_3_date || null,
        interview_3_time: cleanFormData.interview_3_time || null,
        // Clean up empty strings for text fields
        company_name: cleanFormData.company_name || '',
        role: cleanFormData.role || null,
        location: cleanFormData.location || null,
        eligibility: cleanFormData.eligibility || null,
        registration_link: cleanFormData.registration_link || null,
        test_1: cleanFormData.test_1 || null,
        test_2: cleanFormData.test_2 || null,
        test_3: cleanFormData.test_3 || null,
        test_4: cleanFormData.test_4 || null,
        test_5: cleanFormData.test_5 || null,
        interview_1: cleanFormData.interview_1 || null,
        interview_2: cleanFormData.interview_2 || null,
        interview_3: cleanFormData.interview_3 || null,
        result_1: cleanFormData.result_1 || 'pending',
        result_2: cleanFormData.result_2 || 'pending',
        result_3: cleanFormData.result_3 || 'pending',
        result_4: cleanFormData.result_4 || 'pending',
        result_5: cleanFormData.result_5 || 'pending',
        interview_result_1: cleanFormData.interview_result_1 || 'pending',
        interview_result_2: cleanFormData.interview_result_2 || 'pending',
        interview_result_3: cleanFormData.interview_result_3 || 'pending',
      }

      if (placement) {
        const { error } = await supabase
          .from('placements')
          .update(dataToSubmit)
          .eq('id', placement.id)

        if (error) throw error

        toast({
          title: "Placement updated!",
          description: "Your placement record has been updated successfully.",
        })
      } else {
        const { error } = await supabase
          .from('placements')
          .insert([dataToSubmit])

        if (error) throw error

        toast({
          title: "Placement added!",
          description: "Your placement record has been added successfully.",
        })
      }

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean | null) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-update status based on eligibility
      if (field === 'are_you_eligible') {
        if (value === false) {
          updated.status = 'Not Eligible'
        } else if (value === true && prev.status === 'Not Eligible') {
          updated.status = 'Applied'
        }
      }
      
      return updated
    })
  }

  const handleAIDataExtracted = (data: any) => {
    setFormData(prev => ({
      ...prev,
      company_name: data.company_name || '',
      role: data.role || '',
      ctc: data.ctc || '',
      location: data.location || '',
      eligibility: data.eligibility || '',
      registration_deadline: data.registration_deadline || '',
      registration_deadline_time: data.registration_deadline_time || '',
      registration_link: data.registration_link || '',
      status: data.status || 'Applied',
      // Test data
      test_1: data.test_1 || '',
      test_1_date: data.test_1_date || '',
      test_1_time: data.test_1_time || '',
      test_2: data.test_2 || '',
      test_2_date: data.test_2_date || '',
      test_2_time: data.test_2_time || '',
      test_3: data.test_3 || '',
      test_3_date: data.test_3_date || '',
      test_3_time: data.test_3_time || '',
      test_4: data.test_4 || '',
      test_4_date: data.test_4_date || '',
      test_4_time: data.test_4_time || '',
      test_5: data.test_5 || '',
      test_5_date: data.test_5_date || '',
      test_5_time: data.test_5_time || '',
      // Interview data
      interview_1: data.interview_1 || '',
      interview_1_date: data.interview_1_date || '',
      interview_1_time: data.interview_1_time || '',
      interview_2: data.interview_2 || '',
      interview_2_date: data.interview_2_date || '',
      interview_2_time: data.interview_2_time || '',
      interview_3: data.interview_3 || '',
      interview_3_date: data.interview_3_date || '',
      interview_3_time: data.interview_3_time || '',
    }))
    setCurrentView('form')
    toast({
      title: "Data imported!",
      description: "AI extracted data has been imported to the form. Please review and complete the remaining details.",
    })
  }

  const handleAICancel = () => {
    setCurrentView('form')
  }

  const handleFollowUpComplete = () => {
    onSuccess()
    setCurrentView('form')
  }

  if (currentView === 'ai-parser') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              AI Email Parser
            </h2>
            <p className="text-muted-foreground">
              Use AI to extract placement details from email content
            </p>
          </div>
          <Button variant="outline" onClick={handleAICancel}>
            Back to Manual Form
          </Button>
        </div>
        <AIEmailParser 
          onDataExtracted={handleAIDataExtracted}
          onCancel={handleAICancel}
        />
      </div>
    )
  }

  if (currentView === 'ai-follow-up-parser') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              AI Follow-Up Parser
            </h2>
            <p className="text-muted-foreground">
              Use AI to extract follow-up details from email content
            </p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('form')}>
            Back to Manual Form
          </Button>
        </div>
        <AIFollowUpParser 
          onUpdateComplete={handleFollowUpComplete}
          onCancel={() => setCurrentView('form')}
        />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>{placement ? 'Edit Placement' : 'Add New Placement'}</span>
        </CardTitle>
        <CardDescription>
          {placement ? 'Update placement details' : 'Track your placement application'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentView('ai-parser')}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Use AI Email Parser
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('ai-follow-up-parser')}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Use AI Follow-Up Parser
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="tests">Tests</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => updateFormData('company_name', e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => updateFormData('role', e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctc">CTC (in LPA)</Label>
                  <Input
                    id="ctc"
                    type="number"
                    step="0.01"
                    value={formData.ctc}
                    onChange={(e) => updateFormData('ctc', e.target.value)}
                    placeholder="e.g., 12.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="e.g., Bangalore, Remote"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => updateFormData('registration_deadline', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline_time">Time</Label>
                  <Input
                    id="registration_deadline_time"
                    type="time"
                    value={formData.registration_deadline_time}
                    onChange={(e) => updateFormData('registration_deadline_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_link">Registration Link</Label>
                  <Input
                    id="registration_link"
                    type="url"
                    value={formData.registration_link}
                    onChange={(e) => updateFormData('registration_link', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibility">Eligibility Criteria</Label>
                <Textarea
                  id="eligibility"
                  value={formData.eligibility}
                  onChange={(e) => updateFormData('eligibility', e.target.value)}
                  placeholder="Describe the eligibility criteria..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Are You Eligible?</Label>
                <Select 
                  value={formData.are_you_eligible === null ? '' : formData.are_you_eligible.toString()}
                  onValueChange={(value) => updateFormData('are_you_eligible', value === '' ? null : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select eligibility status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-sure">Not Sure</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Test Rounds</h3>
              </div>
              {[1, 2, 3, 4, 5].map((num) => (
                <Card key={num} className="p-4">
                  <h4 className="font-medium mb-3">Test {num}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`test_${num}`}>Test Description</Label>
                      <Input
                        id={`test_${num}`}
                        value={formData[`test_${num}` as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(`test_${num}`, e.target.value)}
                        placeholder="e.g., Online Coding Test, Aptitude Test"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`test_${num}_date`}>Date</Label>
                      <Input
                        id={`test_${num}_date`}
                        type="date"
                        value={formData[`test_${num}_date` as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(`test_${num}_date`, e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`test_${num}_time`}>Time</Label>
                      <Input
                        id={`test_${num}_time`}
                        type="time"
                        value={formData[`test_${num}_time` as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(`test_${num}_time`, e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`result_${num}`}>Result</Label>
                      <Select 
                        value={formData[`result_${num}` as keyof typeof formData] as string}
                        onValueChange={(value) => updateFormData(`result_${num}`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="Passed">Passed</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                          <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="interviews" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Interview Rounds</h3>
              </div>
              {[1, 2, 3].map((num) => (
                <Card key={num} className="p-4">
                  <h4 className="font-medium mb-3">Interview {num}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`interview_${num}`}>Interview Type</Label>
                      <Input
                        id={`interview_${num}`}
                        value={formData[`interview_${num}` as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(`interview_${num}`, e.target.value)}
                        placeholder="e.g., Technical, HR, Managerial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`interview_${num}_date`}>Date</Label>
                      <Input
                        id={`interview_${num}_date`}
                        type="date"
                        value={formData[`interview_${num}_date` as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(`interview_${num}_date`, e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`interview_${num}_time`}>Time</Label>
                      <Input
                        id={`interview_${num}_time`}
                        type="time"
                        value={formData[`interview_${num}_time` as keyof typeof formData] as string}
                        onChange={(e) => updateFormData(`interview_${num}_time`, e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`interview_result_${num}`}>Result</Label>
                      <Select 
                        value={formData[`interview_result_${num}` as keyof typeof formData] as string}
                        onValueChange={(value) => updateFormData(`interview_result_${num}`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="Selected">Selected</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                          <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Application Status</h3>
              </div>
              
              {/* Eligibility Warning */}
              {formData.are_you_eligible === false && (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Not Eligible</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    You are not eligible for this placement. Status changes are disabled.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => updateFormData('status', value)}
                  disabled={formData.are_you_eligible === false}
                >
                  <SelectTrigger className={formData.are_you_eligible === false ? "opacity-50" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Selected">Selected</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="Not Eligible">Not Eligible</SelectItem>
                  </SelectContent>
                </Select>
                {formData.are_you_eligible === false && (
                  <p className="text-xs text-muted-foreground">
                    Status cannot be changed for ineligible placements. Update eligibility first.
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Status Guide</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Applied</Badge>
                    <span className="text-sm text-muted-foreground">Initial application submitted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-info text-info-foreground">In Progress</Badge>
                    <span className="text-sm text-muted-foreground">Tests/interviews ongoing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-success text-success-foreground">Selected</Badge>
                    <span className="text-sm text-muted-foreground">Offer received</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">Rejected</Badge>
                    <span className="text-sm text-muted-foreground">Application rejected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Withdrawn</Badge>
                    <span className="text-sm text-muted-foreground">Application withdrawn</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">Not Eligible</Badge>
                    <span className="text-sm text-muted-foreground">Not eligible for this placement</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {placement ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                placement ? 'Update Placement' : 'Add Placement'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}