import {
    generateInterviewReport,
    getAllInterviewReports,
    getInterviewReportsById
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


    return {
        generateReport,
        getReportById,
        getReports,
        loading,
        reports,
        report
    }
}