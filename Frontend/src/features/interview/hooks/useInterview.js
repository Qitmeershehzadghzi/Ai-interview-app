import {
    generateInterviewReport,
    getAllInterviewReports,
    getInterviewReportsById,
    generateResumePdf as generateResumePdfAPI // ✅ rename to avoid conflict
} from '../services/interview.api.js'

import { useContext } from 'react'
import { InterviewContext } from '../interview.context.jsx'

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error('useInterview must be used within InterviewProvider')
    }

    const {
        loading,
        setLoading,
        reports,
        setReports,
        report,
        setReport
    } = context


    // ✅ Generate Interview Report
    const generateReport = async ({ selfDescription, jobDescription, resume }) => {

        setLoading(true)

        try {

            const data = await generateInterviewReport({
                selfDescription,
                jobDescription,
                resume
            })

            setReport(data.data)
            setReports(prev => [data.data, ...prev])

            return data.data

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)

        }

    }


    // ✅ Get Single Report
    const getReportById = async (interviewId) => {

        setLoading(true)

        try {

            const data = await getInterviewReportsById(interviewId)

            if (data.success) {
                setReport(data.data)
                return data.data
            }

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)

        }

    }


    // ✅ Get All Reports
    const getReports = async () => {

        try {

            const data = await getAllInterviewReports()

            if (data.success) {
                setReports(data.data)
                return data.data
            }

        } catch (error) {

            console.log(error)

        }

    }


    // ✅ FIXED: Generate Resume PDF
    const generateResumePdf = async ({ interviewReportId }) => {

        setLoading(true)

        try {

            // 🔥 call API (NOT itself)
            const response = await generateResumePdfAPI({ interviewReportId })

            // 🔥 response is blob (PDF)
            const url = window.URL.createObjectURL(new Blob([response]))

            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'resume.pdf')

            document.body.appendChild(link)
            link.click()

            link.remove()
            window.URL.revokeObjectURL(url)

        } catch (error) {

            console.log(error)

        } finally {

            setLoading(false)

        }
    }


    return {
        generateReport,
        getReportById,
        getReports,
        loading,
        reports,
        report,
        generateResumePdf
    }
}