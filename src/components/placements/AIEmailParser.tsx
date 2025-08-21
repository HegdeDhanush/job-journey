import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Mail, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ExtractedData {
  company_name: string
  role: string
  ctc: string
  location: string
  eligibility: string
  registration_deadline: string
  registration_deadline_time: string
  registration_link: string
  status: 'Applied' | 'In Progress' | 'Selected' | 'Rejected' | 'Withdrawn' | 'Not Eligible'
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
}

interface AIEmailParserProps {
  onDataExtracted: (data: ExtractedData) => void
  onCancel: () => void
}

export const AIEmailParser = ({ onDataExtracted, onCancel }: AIEmailParserProps) => {
  const [emailContent, setEmailContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const { toast } = useToast()

  const extractDataFromEmail = async () => {
    if (!emailContent.trim()) {
      toast({
        title: "Error",
        description: "Please paste the email content first.",
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
        Extract placement details from the following email content. Return the data in JSON format with these exact field names:
        {
          "company_name": "Company name",
          "role": "Job role/position", 
          "ctc": "Cost to Company (CTC) or salary",
          "location": "Job location",
          "eligibility": "Eligibility criteria",
          "registration_deadline": "Registration deadline date in YYYY-MM-DD format (e.g., 2024-12-31)",
          "registration_deadline_time": "Registration deadline time in HH:MM format (e.g., 23:59) or empty string if not specified",
          "registration_link": "Registration link/URL",
          "status": "Applied",
          "test_1": "First test/round description (e.g., Online Coding Test, Aptitude Test)",
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
          "interview_1": "First interview type (e.g., Technical, HR, Managerial) or empty string",
          "interview_1_date": "First interview date in YYYY-MM-DD format or empty string",
          "interview_1_time": "First interview time in HH:MM format or empty string",
          "interview_2": "Second interview type or empty string",
          "interview_2_date": "Second interview date in YYYY-MM-DD format or empty string",
          "interview_2_time": "Second interview time in HH:MM format or empty string",
          "interview_3": "Third interview type or empty string",
          "interview_3_date": "Third interview date in YYYY-MM-DD format or empty string",
          "interview_3_time": "Third interview time in HH:MM format or empty string"
        }

        Important instructions:
        - For dates: Extract and convert to YYYY-MM-DD format
        - For times: Extract and convert to HH:MM format (24-hour)
        - If no specific time is mentioned for registration deadline, use "23:59" as default
        - For tests: Look for keywords like "test", "round", "phase", "assessment", "exam", "coding", "aptitude", "technical"
        - For interviews: Look for keywords like "interview", "technical round", "HR round", "final round", "managerial"
        - Only populate fields if the information is clearly mentioned in the email
        - Use empty strings for fields where information is not available (NOT "Not specified")
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

      const parsedData = JSON.parse(jsonMatch[0]) as ExtractedData
      setExtractedData(parsedData)
      
      toast({
        title: "Success",
        description: "Data extracted successfully! Please verify the details below.",
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

  const handleVerifyAndProceed = () => {
    if (extractedData) {
      // Clean the data before passing it to the parent
      const cleanedData = {
        ...extractedData,
        // Ensure no "Not specified" values
        test_1: extractedData.test_1 && extractedData.test_1 !== 'Not specified' ? extractedData.test_1 : '',
        test_1_date: extractedData.test_1_date && extractedData.test_1_date !== 'Not specified' ? extractedData.test_1_date : '',
        test_1_time: extractedData.test_1_time && extractedData.test_1_time !== 'Not specified' ? extractedData.test_1_time : '',
        test_2: extractedData.test_2 && extractedData.test_2 !== 'Not specified' ? extractedData.test_2 : '',
        test_2_date: extractedData.test_2_date && extractedData.test_2_date !== 'Not specified' ? extractedData.test_2_date : '',
        test_2_time: extractedData.test_2_time && extractedData.test_2_time !== 'Not specified' ? extractedData.test_2_time : '',
        test_3: extractedData.test_3 && extractedData.test_3 !== 'Not specified' ? extractedData.test_3 : '',
        test_3_date: extractedData.test_3_date && extractedData.test_3_date !== 'Not specified' ? extractedData.test_3_date : '',
        test_3_time: extractedData.test_3_time && extractedData.test_3_time !== 'Not specified' ? extractedData.test_3_time : '',
        test_4: extractedData.test_4 && extractedData.test_4 !== 'Not specified' ? extractedData.test_4 : '',
        test_4_date: extractedData.test_4_date && extractedData.test_4_date !== 'Not specified' ? extractedData.test_4_date : '',
        test_4_time: extractedData.test_4_time && extractedData.test_4_time !== 'Not specified' ? extractedData.test_4_time : '',
        test_5: extractedData.test_5 && extractedData.test_5 !== 'Not specified' ? extractedData.test_5 : '',
        test_5_date: extractedData.test_5_date && extractedData.test_5_date !== 'Not specified' ? extractedData.test_5_date : '',
        test_5_time: extractedData.test_5_time && extractedData.test_5_time !== 'Not specified' ? extractedData.test_5_time : '',
        interview_1: extractedData.interview_1 && extractedData.interview_1 !== 'Not specified' ? extractedData.interview_1 : '',
        interview_1_date: extractedData.interview_1_date && extractedData.interview_1_date !== 'Not specified' ? extractedData.interview_1_date : '',
        interview_1_time: extractedData.interview_1_time && extractedData.interview_1_time !== 'Not specified' ? extractedData.interview_1_time : '',
        interview_2: extractedData.interview_2 && extractedData.interview_2 !== 'Not specified' ? extractedData.interview_2 : '',
        interview_2_date: extractedData.interview_2_date && extractedData.interview_2_date !== 'Not specified' ? extractedData.interview_2_date : '',
        interview_2_time: extractedData.interview_2_time && extractedData.interview_2_time !== 'Not specified' ? extractedData.interview_2_time : '',
        interview_3: extractedData.interview_3 && extractedData.interview_3 !== 'Not specified' ? extractedData.interview_3 : '',
        interview_3_date: extractedData.interview_3_date && extractedData.interview_3_date !== 'Not specified' ? extractedData.interview_3_date : '',
        interview_3_time: extractedData.interview_3_time && extractedData.interview_3_time !== 'Not specified' ? extractedData.interview_3_time : '',
      }
      
      setIsVerified(true)
      onDataExtracted(cleanedData)
    }
  }

  const handleManualEdit = (field: keyof ExtractedData, value: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [field]: value
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Email Parser
          </CardTitle>
          <CardDescription>
            Paste the complete email content below and let AI extract all the placement details automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Content</label>
            <Textarea
              placeholder="Paste the complete email content here..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={extractDataFromEmail}
              disabled={isProcessing || !emailContent.trim()}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Extract with AI'}
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
              Extracted Data
            </CardTitle>
            <CardDescription>
              Review and edit the extracted information before proceeding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
              </TabsList>
              <TabsContent value="basic">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <input
                      type="text"
                      value={extractedData.company_name}
                      onChange={(e) => handleManualEdit('company_name', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <input
                      type="text"
                      value={extractedData.role}
                      onChange={(e) => handleManualEdit('role', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CTC</label>
                    <input
                      type="text"
                      value={extractedData.ctc}
                      onChange={(e) => handleManualEdit('ctc', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <input
                      type="text"
                      value={extractedData.location}
                      onChange={(e) => handleManualEdit('location', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Eligibility</label>
                    <input
                      type="text"
                      value={extractedData.eligibility}
                      onChange={(e) => handleManualEdit('eligibility', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration Deadline Date</label>
                    <input
                      type="date"
                      value={extractedData.registration_deadline}
                      onChange={(e) => handleManualEdit('registration_deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Registration Deadline Time</label>
                    <input
                      type="time"
                      value={extractedData.registration_deadline_time}
                      onChange={(e) => handleManualEdit('registration_deadline_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Registration Link</label>
                    <input
                      type="text"
                      value={extractedData.registration_link}
                      onChange={(e) => handleManualEdit('registration_link', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tests">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 1 Description</label>
                    <input
                      type="text"
                      value={extractedData.test_1}
                      onChange={(e) => handleManualEdit('test_1', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 1 Date</label>
                    <input
                      type="date"
                      value={extractedData.test_1_date}
                      onChange={(e) => handleManualEdit('test_1_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 1 Time</label>
                    <input
                      type="time"
                      value={extractedData.test_1_time}
                      onChange={(e) => handleManualEdit('test_1_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 2 Description</label>
                    <input
                      type="text"
                      value={extractedData.test_2}
                      onChange={(e) => handleManualEdit('test_2', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 2 Date</label>
                    <input
                      type="date"
                      value={extractedData.test_2_date}
                      onChange={(e) => handleManualEdit('test_2_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 2 Time</label>
                    <input
                      type="time"
                      value={extractedData.test_2_time}
                      onChange={(e) => handleManualEdit('test_2_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 3 Description</label>
                    <input
                      type="text"
                      value={extractedData.test_3}
                      onChange={(e) => handleManualEdit('test_3', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 3 Date</label>
                    <input
                      type="date"
                      value={extractedData.test_3_date}
                      onChange={(e) => handleManualEdit('test_3_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 3 Time</label>
                    <input
                      type="time"
                      value={extractedData.test_3_time}
                      onChange={(e) => handleManualEdit('test_3_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 4 Description</label>
                    <input
                      type="text"
                      value={extractedData.test_4}
                      onChange={(e) => handleManualEdit('test_4', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 4 Date</label>
                    <input
                      type="date"
                      value={extractedData.test_4_date}
                      onChange={(e) => handleManualEdit('test_4_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 4 Time</label>
                    <input
                      type="time"
                      value={extractedData.test_4_time}
                      onChange={(e) => handleManualEdit('test_4_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 5 Description</label>
                    <input
                      type="text"
                      value={extractedData.test_5}
                      onChange={(e) => handleManualEdit('test_5', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 5 Date</label>
                    <input
                      type="date"
                      value={extractedData.test_5_date}
                      onChange={(e) => handleManualEdit('test_5_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Test 5 Time</label>
                    <input
                      type="time"
                      value={extractedData.test_5_time}
                      onChange={(e) => handleManualEdit('test_5_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="interviews">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 1 Type</label>
                    <input
                      type="text"
                      value={extractedData.interview_1}
                      onChange={(e) => handleManualEdit('interview_1', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 1 Date</label>
                    <input
                      type="date"
                      value={extractedData.interview_1_date}
                      onChange={(e) => handleManualEdit('interview_1_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 1 Time</label>
                    <input
                      type="time"
                      value={extractedData.interview_1_time}
                      onChange={(e) => handleManualEdit('interview_1_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 2 Type</label>
                    <input
                      type="text"
                      value={extractedData.interview_2}
                      onChange={(e) => handleManualEdit('interview_2', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 2 Date</label>
                    <input
                      type="date"
                      value={extractedData.interview_2_date}
                      onChange={(e) => handleManualEdit('interview_2_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 2 Time</label>
                    <input
                      type="time"
                      value={extractedData.interview_2_time}
                      onChange={(e) => handleManualEdit('interview_2_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 3 Type</label>
                    <input
                      type="text"
                      value={extractedData.interview_3}
                      onChange={(e) => handleManualEdit('interview_3', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 3 Date</label>
                    <input
                      type="date"
                      value={extractedData.interview_3_date}
                      onChange={(e) => handleManualEdit('interview_3_date', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Interview 3 Time</label>
                    <input
                      type="time"
                      value={extractedData.interview_3_time}
                      onChange={(e) => handleManualEdit('interview_3_time', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleVerifyAndProceed}
                className="flex items-center gap-2"
                disabled={isVerified}
              >
                <CheckCircle className="h-4 w-4" />
                {isVerified ? 'Verified' : 'Verify & Proceed'}
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