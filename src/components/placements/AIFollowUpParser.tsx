import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Mail, Sparkles, CheckCircle, AlertCircle, Building2, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase, type Placement } from '@/lib/supabase'

interface FollowUpData {
  company_name: string
  // Test details
  test_1: string
  test_1_date: string
  test_1_time: string
  test_2: string
  test_2_date: string
  test_2_time: string
  test_3: string
  test_3_date: string
  test_3_time: string
  test_4: string
  test_4_date: string
  test_4_time: string
  test_5: string
  test_5_date: string
  test_5_time: string
  // Interview details
  interview_1: string
  interview_1_date: string
  interview_1_time: string
  interview_2: string
  interview_2_date: string
  interview_2_time: string
  interview_3: string
  interview_3_date: string
  interview_3_time: string
  // Status updates
  status: 'Applied' | 'In Progress' | 'Selected' | 'Rejected' | 'Withdrawn' | 'Not Eligible'
  // Results
  result_1: string
  result_2: string
  result_3: string
  result_4: string
  result_5: string
  interview_result_1: string
  interview_result_2: string
  interview_result_3: string
}

interface AIFollowUpParserProps {
  onUpdateComplete: () => void
  onCancel: () => void
}

export const AIFollowUpParser = ({ onUpdateComplete, onCancel }: AIFollowUpParserProps) => {
  const [emailContent, setEmailContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<FollowUpData | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null)
  const [placements, setPlacements] = useState<Placement[]>([])
  const [isLoadingPlacements, setIsLoadingPlacements] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlacements()
  }, [])

  const fetchPlacements = async () => {
    try {
      setIsLoadingPlacements(true)
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
      setIsLoadingPlacements(false)
    }
  }

  const extractDataFromEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Error",
        description: "Please paste the email content first.",
        variant: "destructive",
      })
      return
    }

    if (!selectedPlacement) {
      toast({
        title: "Error",
        description: "Please select a placement to update.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      // Initialize Gemini AI
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) {
        throw new Error('Gemini API key not configured')
      }

      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      const prompt = `
        Extract follow-up placement details from the following email content. This is for updating an existing placement record for ${selectedPlacement.company_name}.
        
        Return the data in JSON format with these exact field names:
        {
          "company_name": "${selectedPlacement.company_name}",
          "test_1": "First test/round description or empty string",
          "test_1_date": "First test date in YYYY-MM-DD format or empty string",
          "test_1_time": "First test time in HH:MM format or empty string",
          "test_2": "Second test/round description or empty string",
          "test_2_date": "Second test date in YYYY-MM-DD format or empty string",
          "test_2_time": "Second test time in HH:MM format or empty string",
          "test_3": "Third test/round description or empty string",
          "test_3_date": "Third test date in YYYY-MM-DD format or empty string",
          "test_3_time": "Third test time in HH:MM format or empty string",
          "test_4": "Fourth test/round description or empty string",
          "test_4_date": "Fourth test date in YYYY-MM-DD format or empty string",
          "test_4_time": "Fourth test time in HH:MM format or empty string",
          "test_5": "Fifth test/round description or empty string",
          "test_5_date": "Fifth test date in YYYY-MM-DD format or empty string",
          "test_5_time": "Fifth test time in HH:MM format or empty string",
          "interview_1": "First interview type or empty string",
          "interview_1_date": "First interview date in YYYY-MM-DD format or empty string",
          "interview_1_time": "First interview time in HH:MM format or empty string",
          "interview_2": "Second interview type or empty string",
          "interview_2_date": "Second interview date in YYYY-MM-DD format or empty string",
          "interview_2_time": "Second interview time in HH:MM format or empty string",
          "interview_3": "Third interview type or empty string",
          "interview_3_date": "Third interview date in YYYY-MM-DD format or empty string",
          "interview_3_time": "Third interview time in HH:MM format or empty string",
          "status": "Current status (Applied, In Progress, Selected, Rejected, Withdrawn, Not Eligible)",
          "result_1": "Test 1 result (pending, Passed, Failed, Waitlisted) or empty string",
          "result_2": "Test 2 result (pending, Passed, Failed, Waitlisted) or empty string",
          "result_3": "Test 3 result (pending, Passed, Failed, Waitlisted) or empty string",
          "result_4": "Test 4 result (pending, Passed, Failed, Waitlisted) or empty string",
          "result_5": "Test 5 result (pending, Passed, Failed, Waitlisted) or empty string",
          "interview_result_1": "Interview 1 result (pending, Selected, Rejected, Waitlisted) or empty string",
          "interview_result_2": "Interview 2 result (pending, Selected, Rejected, Waitlisted) or empty string",
          "interview_result_3": "Interview 3 result (pending, Selected, Rejected, Waitlisted) or empty string"
        }

        Important instructions:
        - This is a follow-up email, so only extract NEW information that updates the existing placement
        - For dates: Extract and convert to YYYY-MM-DD format
        - For times: Extract and convert to HH:MM format (24-hour)
        - For tests: Look for keywords like "test", "round", "phase", "assessment", "exam", "coding", "aptitude", "technical"
        - For interviews: Look for keywords like "interview", "technical round", "HR round", "final round", "managerial"
        - For results: Look for keywords like "passed", "failed", "selected", "rejected", "waitlisted", "qualified", "shortlisted"
        - For status: Determine if this email indicates a status change
        - Only populate fields if the information is clearly mentioned in the email
        - Use empty strings for fields where information is not available
        - Convert any date format (DD/MM/YYYY, MM/DD/YYYY, etc.) to YYYY-MM-DD
        - Convert any time format (12-hour or 24-hour) to 24-hour HH:MM format

        Email content:
        ${emailContent}

        Only return valid JSON, no additional text.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from AI response')
      }

      const parsedData = JSON.parse(jsonMatch[0]) as FollowUpData
      setExtractedData(parsedData)
      
      toast({
        title: "Success",
        description: "Follow-up data extracted successfully! Please verify the details below.",
      })
    } catch (error) {
      console.error('AI extraction error:', error)
      toast({
        title: "Error",
        description: "Failed to extract data from email. Please check the content and try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVerifyAndUpdate = async () => {
    if (!extractedData || !selectedPlacement) return

    setIsVerified(true)
    try {
      // Prepare update data - only include non-empty fields
      const updateData: any = {}
      
      // Add test data
      if (extractedData.test_1) updateData.test_1 = extractedData.test_1
      if (extractedData.test_1_date) updateData.test_1_date = extractedData.test_1_date
      if (extractedData.test_1_time) updateData.test_1_time = extractedData.test_1_time
      if (extractedData.test_2) updateData.test_2 = extractedData.test_2
      if (extractedData.test_2_date) updateData.test_2_date = extractedData.test_2_date
      if (extractedData.test_2_time) updateData.test_2_time = extractedData.test_2_time
      if (extractedData.test_3) updateData.test_3 = extractedData.test_3
      if (extractedData.test_3_date) updateData.test_3_date = extractedData.test_3_date
      if (extractedData.test_3_time) updateData.test_3_time = extractedData.test_3_time
      if (extractedData.test_4) updateData.test_4 = extractedData.test_4
      if (extractedData.test_4_date) updateData.test_4_date = extractedData.test_4_date
      if (extractedData.test_4_time) updateData.test_4_time = extractedData.test_4_time
      if (extractedData.test_5) updateData.test_5 = extractedData.test_5
      if (extractedData.test_5_date) updateData.test_5_date = extractedData.test_5_date
      if (extractedData.test_5_time) updateData.test_5_time = extractedData.test_5_time

      // Add interview data
      if (extractedData.interview_1) updateData.interview_1 = extractedData.interview_1
      if (extractedData.interview_1_date) updateData.interview_1_date = extractedData.interview_1_date
      if (extractedData.interview_1_time) updateData.interview_1_time = extractedData.interview_1_time
      if (extractedData.interview_2) updateData.interview_2 = extractedData.interview_2
      if (extractedData.interview_2_date) updateData.interview_2_date = extractedData.interview_2_date
      if (extractedData.interview_2_time) updateData.interview_2_time = extractedData.interview_2_time
      if (extractedData.interview_3) updateData.interview_3 = extractedData.interview_3
      if (extractedData.interview_3_date) updateData.interview_3_date = extractedData.interview_3_date
      if (extractedData.interview_3_time) updateData.interview_3_time = extractedData.interview_3_time

      // Add status update only if eligible
      if (extractedData.status && selectedPlacement.are_you_eligible !== false) {
        updateData.status = extractedData.status
      }

      // Add results
      if (extractedData.result_1) updateData.result_1 = extractedData.result_1
      if (extractedData.result_2) updateData.result_2 = extractedData.result_2
      if (extractedData.result_3) updateData.result_3 = extractedData.result_3
      if (extractedData.result_4) updateData.result_4 = extractedData.result_4
      if (extractedData.result_5) updateData.result_5 = extractedData.result_5
      if (extractedData.interview_result_1) updateData.interview_result_1 = extractedData.interview_result_1
      if (extractedData.interview_result_2) updateData.interview_result_2 = extractedData.interview_result_2
      if (extractedData.interview_result_3) updateData.interview_result_3 = extractedData.interview_result_3

      // Update the placement
      const { error } = await supabase
        .from('placements')
        .update(updateData)
        .eq('id', selectedPlacement.id)

      if (error) throw error

      toast({
        title: "Placement Updated!",
        description: selectedPlacement.are_you_eligible === false 
          ? "Follow-up information updated (status changes blocked for ineligible placement)."
          : "Follow-up information has been successfully updated.",
      })

      onUpdateComplete()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update placement: " + error.message,
        variant: "destructive",
      })
    }
  }

  const handleManualEdit = (field: keyof FollowUpData, value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value
      })
    }
  }

  if (isLoadingPlacements) {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Follow-Up Email Parser
          </CardTitle>
          <CardDescription>
            Parse follow-up emails to update existing placement information with new test/interview details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placement Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Placement to Update</label>
            <Select
              value={selectedPlacement?.id || ''}
              onValueChange={(value) => {
                const placement = placements.find(p => p.id === value)
                setSelectedPlacement(placement || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a placement to update" />
              </SelectTrigger>
              <SelectContent>
                {placements.map((placement) => (
                  <SelectItem key={placement.id} value={placement.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{placement.company_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {placement.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Follow-Up Email Content</label>
            <Textarea
              placeholder="Paste the follow-up email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={extractDataFromEmail}
              disabled={isProcessing || !emailContent.trim() || !selectedPlacement}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Extract & Update'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Extracted Follow-Up Data
            </CardTitle>
            <CardDescription>
              Review and edit the extracted information before updating the placement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="tests" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
                <TabsTrigger value="results">Results & Status</TabsTrigger>
              </TabsList>

              <TabsContent value="tests" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="space-y-2 p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">Test {num}</h4>
                      <input
                        type="text"
                        placeholder="Test description"
                        value={extractedData[`test_${num}` as keyof FollowUpData] as string}
                        onChange={(e) => handleManualEdit(`test_${num}` as keyof FollowUpData, e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          placeholder="Date"
                          value={extractedData[`test_${num}_date` as keyof FollowUpData] as string}
                          onChange={(e) => handleManualEdit(`test_${num}_date` as keyof FollowUpData, e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        />
                        <input
                          type="time"
                          placeholder="Time"
                          value={extractedData[`test_${num}_time` as keyof FollowUpData] as string}
                          onChange={(e) => handleManualEdit(`test_${num}_time` as keyof FollowUpData, e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3].map((num) => (
                    <div key={num} className="space-y-2 p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">Interview {num}</h4>
                      <input
                        type="text"
                        placeholder="Interview type"
                        value={extractedData[`interview_${num}` as keyof FollowUpData] as string}
                        onChange={(e) => handleManualEdit(`interview_${num}` as keyof FollowUpData, e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          placeholder="Date"
                          value={extractedData[`interview_${num}_date` as keyof FollowUpData] as string}
                          onChange={(e) => handleManualEdit(`interview_${num}_date` as keyof FollowUpData, e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        />
                        <input
                          type="time"
                          placeholder="Time"
                          value={extractedData[`interview_${num}_time` as keyof FollowUpData] as string}
                          onChange={(e) => handleManualEdit(`interview_${num}_time` as keyof FollowUpData, e.target.value)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Eligibility Warning */}
                  {selectedPlacement && selectedPlacement.are_you_eligible === false && (
                    <div className="md:col-span-2 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">Not Eligible</h4>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        You are not eligible for {selectedPlacement.company_name}. Status changes are disabled.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status Update</label>
                    <Select
                      value={extractedData.status}
                      onValueChange={(value) => handleManualEdit('status', value)}
                      disabled={selectedPlacement?.are_you_eligible === false}
                    >
                      <SelectTrigger className={selectedPlacement?.are_you_eligible === false ? "opacity-50" : ""}>
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
                    {selectedPlacement?.are_you_eligible === false && (
                      <p className="text-xs text-muted-foreground">
                        Status cannot be updated for ineligible placements.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test Results</label>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="flex items-center gap-2">
                          <span className="text-xs w-8">T{num}:</span>
                          <Select
                            value={extractedData[`result_${num}` as keyof FollowUpData] as string}
                            onValueChange={(value) => handleManualEdit(`result_${num}` as keyof FollowUpData, value)}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Result" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="Passed">Passed</SelectItem>
                              <SelectItem value="Failed">Failed</SelectItem>
                              <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview Results</label>
                    <div className="space-y-2">
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center gap-2">
                          <span className="text-xs w-8">I{num}:</span>
                          <Select
                            value={extractedData[`interview_result_${num}` as keyof FollowUpData] as string}
                            onValueChange={(value) => handleManualEdit(`interview_result_${num}` as keyof FollowUpData, value)}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Result" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="Selected">Selected</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                              <SelectItem value="Waitlisted">Waitlisted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleVerifyAndUpdate}
                className="flex items-center gap-2"
                disabled={isVerified}
              >
                <CheckCircle className="h-4 w-4" />
                {isVerified ? 'Updated' : 'Verify & Update Placement'}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 