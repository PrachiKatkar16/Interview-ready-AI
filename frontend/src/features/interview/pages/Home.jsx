import React, { useState, useRef, useEffect } from 'react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview'
import { useNavigate } from 'react-router' // ✅ FIXED
import { FaMicrophone, FaFileAlt } from 'react-icons/fa'

const Home = () => {

    const { loading, generateReport, reports, getReports } = useInterview()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")

    const resumeInputRef = useRef()
    const navigate = useNavigate()

    // 🎤 START LIVE INTERVIEW
    const startLiveInterview = () => {
        const resumeFile = resumeInputRef.current.files[0]

        navigate("/interview", {
            state: {
                jd: jobDescription,
                self: selfDescription,
                resumeFile
            }
        })
    }

    // 📄 GENERATE REPORT (OLD FEATURE)
    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current.files[0]

        const data = await generateReport({
            jobDescription,
            selfDescription,
            resumeFile
        })

        navigate(`/interview/${data._id}`)
    }

    useEffect(() => {
        getReports()
    }, [])

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading interview report...</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>

                        <textarea
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder="Paste the full job description..."
                            maxLength={5000}
                        />
                    </div>

                    <div className='panel-divider' />

                    {/* Right Panel */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Resume Upload */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                            </label>

                            <input
                                ref={resumeInputRef}
                                type='file'
                                accept='.pdf,.docx'
                            />
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        {/* Self Description */}
                        <div className='self-description'>
                            <label>Quick Self-Description</label>

                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                className='panel__textarea panel__textarea--short'
                                placeholder="Describe your experience..."
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className='interview-card__footer'>

                    <span className='footer-info'>
                        Choose how you want to proceed
                    </span>

                    <div style={{ display: "flex", gap: "10px" }}>

                        {/* 🎤 LIVE INTERVIEW */}
                        <button
                            onClick={startLiveInterview}
                            className='generate-btn'
                        >
                            <FaMicrophone /> Start Live Interview
                        </button>

                        {/* 📄 REPORT */}
                        <button
                            onClick={handleGenerateReport}
                            className='generate-btn'
                        >
                            <FaFileAlt /> Generate Report
                        </button>

                    </div>
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
                                <h3>{report.title || 'Untitled Position'}</h3>

                                <p>
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </p>

                                <p>
                                    Match Score: {report.matchScore}%
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Footer */}
            <footer className='page-footer'>
                <a href='#'>Privacy Policy</a>
                <a href='#'>Terms</a>
            </footer>
        </div>
    )
}

export default Home
