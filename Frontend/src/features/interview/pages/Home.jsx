import React, { useState, useRef, useEffect } from 'react'
import "../styles/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const Home = () => {

    const { loading, generateReport, reports, getReports } = useInterview()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    // 🔹 Fetch reports when page loads
    useEffect(() => {
        getReports()
    }, [])

    const handleGenerateReport = async () => {

        const resumeFile = resumeInputRef.current.files[0]

        const data = await generateReport({
            jobDescription,
            selfDescription,
            resume: resumeFile
        })

        if (!data) {
            alert("Interview report generate nahi hua")
            return
        }

        navigate(`/interview/${data._id}`)
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your profile.</p>
            </header>

            <div className='interview-card'>

                <div className='interview-card__body'>

                    {/* Job Description */}
                    <div className='panel panel--left'>

                        <h2>Target Job Description</h2>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder="Paste job description..."
                        />

                    </div>

                    <div className='panel-divider' />

                    {/* Profile */}
                    <div className='panel panel--right'>

                        <h2>Your Profile</h2>

                        <div className='upload-section'>

                            <label htmlFor='resume'>
                                Upload Resume
                            </label>

                            <input
                                ref={resumeInputRef}
                                type='file'
                                id='resume'
                                name='resume'
                                accept=".pdf,.doc,.docx"
                            />

                        </div>

                        <div className='self-description'>

                            <label htmlFor='selfDescription'>
                                Self Description
                            </label>

                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Write about your skills and experience..."
                            />

                        </div>

                    </div>

                </div>

                <div className='interview-card__footer'>

                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                    >
                        Generate My Interview Strategy
                    </button>

                </div>

            </div>

            {/* Recent Reports */}
            {reports.length > 0 && (

                <section className='recent-reports'>

                    <h2>My Recent Interview Plans</h2>

                    <ul className='reports-list'>

                        {reports.map(report => (
                            <li
                                key={report._id}
                                
                                className='report-item'
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >

                                <h3>{report.title || "Untitled Position"}</h3>

                                <p>
                                    Generated on {new Date(report.createdAt).toLocaleDateString()}
                                </p>

                                <p>
                                    Match Score: {report.matchScore}%
                                </p>

                            </li>

                        ))}

                    </ul>

                </section>

            )}

        </div>
    )
}

export default Home