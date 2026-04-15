import React, { useEffect, useState, useRef } from "react"
import { FaMicrophone, FaStop, FaArrowRight, FaFlagCheckered, FaVideo, FaCamera, FaRobot, FaQuestion, FaComment, FaClipboardList, FaStopwatch, FaExclamationTriangle, FaCheck, FaFileDownload, FaTimes, FaCheckCircle } from "react-icons/fa"
import "../style/interview.scss"

const InterviewSession = ({ jd, resume, self }) => {
  const [conversation, setConversation] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [userAnswer, setUserAnswer] = useState("")
  const [listening, setListening] = useState(false)
  const [error, setError] = useState("")
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [videoStream, setVideoStream] = useState(null)

  const recognitionRef = useRef(null)
  const hasStarted = useRef(false)
  const videoRef = useRef(null)
  const [isInterviewOver, setIsInterviewOver] = useState(false)
  const [report, setReport] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  // TEXT TO SPEECH
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }

  // START MIC
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true

    recognitionRef.current = recognition

    recognition.start()

    recognition.onstart = () => {
      console.log("Listening...")
      setListening(true)
    }

    recognition.onresult = (event) => {
      let transcript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }

      console.log("Speaking:", transcript)
      setUserAnswer(transcript)
    }

    recognition.onerror = (err) => {
      console.error("Speech error:", err)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }
  }

  // STOP MIC
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      console.log("Mic stopped")
    }
  }

  // TOGGLE CAMERA
  const toggleCamera = async () => {
    try {
      if (cameraOn) {
        // Turn off camera
        if (videoStream) {
          videoStream.getTracks().forEach(track => track.stop())
          setVideoStream(null)
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
        setCameraOn(false)
        console.log("Camera off")
      } else {
        // Turn on camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          },
          audio: false
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          
          // Wait for the video to load metadata before playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(err => {
              console.error("Video play error:", err)
            })
          }
        }

        setVideoStream(stream)
        setCameraOn(true)
        console.log("Camera on, stream tracks:", stream.getTracks().length)
      }
    } catch (err) {
      console.error("Camera error:", err)
      setError("Failed to access camera. Please check permissions.")
    }
  }

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [videoStream])

  // START INTERVIEW
  const startInterview = async () => {
    try {
      setError("")
      const res = await fetch("http://localhost:3000/api/interview/start-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jd, resume, self }),
        credentials: "include",
      })

      const data = await res.json()

      console.log("First question:", data)

      if (!data.question) {
        console.error("No question received", data)
        setError("Failed to start interview. Please try again.")
        return
      }

      const firstConversation = [{ role: "ai", message: data.question }]

      setConversation(firstConversation)
      setCurrentQuestion(data.question)

      speak(data.question)

    } catch (err) {
      console.error("Start interview error:", err)
      setError("Failed to start interview. Please check your connection.")
    }
  }

  // SUBMIT ANSWER (MANUAL CONTROL)
  const submitAnswer = async () => {
    try {
      setError("")
      if (!userAnswer.trim()) {
        setError("Please speak something first before submitting")
        return
      }

      stopListening()

      console.log("Final Answer:", userAnswer)

      const updatedConversation = [
        ...conversation,
        { role: "user", message: userAnswer },
      ]

      console.log("Sending conversation:", updatedConversation)

      setConversation(updatedConversation)
      setUserAnswer("")

      const res = await fetch("http://localhost:3000/api/interview/next-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: updatedConversation,
        }),
        credentials: "include",
      })

      const data = await res.json()
      if (data.completed) {
        console.log("Interview Finished")

        setInterviewEnded(true)
        setCurrentQuestion("Interview completed!")

        speak("Your interview is complete. Generating report.")

        return
      }

      if (!data.question) {
        console.error("BACKEND ERROR:", data)
        setError(data.error || "Failed to get next question")
        return
      }

      console.log("Next Question:", data.question)

      setConversation((prev) => [
        ...prev,
        { role: "ai", message: data.question },
      ])

      setCurrentQuestion(data.question)

      speak(data.question)

    } catch (err) {
      console.error("Submit error:", err)
      setError("Error submitting answer. Please try again.")
    }
  }

  // END INTERVIEW
  const endInterview = async () => {
    try {
      // STOP LISTENING IMMEDIATELY
      stopListening()
      
      // STOP AI SPEECH
      speechSynthesis.cancel()
      
      // DISABLE ALL CONTROLS INSTANTLY
      setInterviewEnded(true)
      setGeneratingReport(true)
      setError("")

      const res = await fetch("http://localhost:3000/api/interview/end-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversation }),
        credentials: "include",
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Failed to generate report")
        setGeneratingReport(false)
        return
      }

      // GET REPORT TEXT
      const data = await res.json()

      if (data.report) {
        setReport(data.report)
        setShowReport(true)
      }

      setGeneratingReport(false)

    } catch (err) {
      console.error("End interview error:", err)
      setError("Failed to generate report. Please try again.")
      setGeneratingReport(false)
    }
  }

  const downloadReport = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/interview/download-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ report }),
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to download report")
      }

      const blob = await res.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "Interview_Report.docx"
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download report")
    }
  }


  // RUN ONCE
  useEffect(() => {
    if (!hasStarted.current) {
      startInterview()
      hasStarted.current = true
    }
  }, [])

  return (
    <div className="interview-session">
      {/* Header */}
      <div className="session-header">
        <h1>
          <FaMicrophone className="icon" />
          AI Interview in Progress
        </h1>
        <p>Answer each question thoughtfully. Click the microphone to start speaking.</p>
      </div>

      {/* Main Container */}
      <div className="session-container">
        {/* Content Area */}
        <div className="session-content">
          {/* Error Alert */}
          {error && (
            <div className="session-alert error">
              <FaExclamationTriangle className="icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Interview Ended Message */}
          {interviewEnded && generatingReport && (
            <div className="session-alert success">
              <FaStopwatch className="icon" />
              <span>Interview Ended! Generating your report...</span>
            </div>
          )}

          {/* Report Generated Message */}
          {interviewEnded && !generatingReport && showReport && (
            <div className="session-alert success">
              <FaCheck className="icon" />
              <span>Interview completed! Your report is ready.</span>
            </div>
          )}

          {/* Two Column Layout: AI Avatar + Question | Student Camera */}
          {!generatingReport && (
            <div className="session-main-layout">
            {/* Left: AI Agent */}
            <div className="session-ai-section">
              {/* AI Avatar */}
              <div className="ai-avatar-container">
                <div className="ai-avatar">
                  <FaRobot className="avatar-icon" />
                  <div className="avatar-status">
                    <span className="status-dot listening"></span>
                    <span className="status-label">Interviewer</span>
                  </div>
                </div>
              </div>

              {/* Question Section */}
              <div className="session-question">
                <div className="section-label">
                  <FaQuestion className="icon" />
                  AI Question
                </div>
                <div className={`question-box ${!currentQuestion ? "loading" : ""}`}>
                  {currentQuestion ? (
                    <p>{currentQuestion}</p>
                  ) : (
                    <p>Loading first question...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Student Camera */}
            <div className="session-student-section">
              {/* Camera Toggle Button */}
              <div className="camera-toggle-header">
                <h3>Your Camera</h3>
                <button
                  className={`btn-camera-toggle ${cameraOn ? "active" : ""}`}
                  onClick={toggleCamera}
                  title={cameraOn ? "Disable camera" : "Enable camera"}
                >
                  {cameraOn ? <FaVideo /> : <FaCamera />}
                  {cameraOn ? "Camera On" : "Camera Off"}
                </button>
              </div>

              {/* Video Feed */}
              <div className="video-container">
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "scaleX(-1)",
                      backgroundColor: "#000"
                    }}
                    className="video-feed"
                  />
                ) : (
                  <div className="video-placeholder">
                    <FaCamera className="placeholder-icon" />
                    <p>Camera is off</p>
                    <p className="placeholder-hint">Click the button above to turn on your camera</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Mic Status */}
          {!generatingReport && (
            <>
              <div className="session-mic-status">
            <div className={`status-indicator ${listening ? "recording" : ""}`}></div>
            <span className={`status-text ${listening ? "recording" : ""}`}>
              {listening ? (
                <><FaMicrophone /> Listening...</>
              ) : (
                <>⏸️ Mic Off</>
              )}
            </span>
          </div>

          {/* Answer Section */}
          <div className="session-answer">
            <div className="section-label">
              <FaComment className="icon" />
              Your Answer
            </div>
            <div className="answer-box">
              {userAnswer ? (
                <p>{userAnswer}</p>
              ) : (
                <p className="placeholder">Start speaking... Your answer will appear here</p>
              )}
            </div>
            {userAnswer && (
              <div className="char-counter">{userAnswer.length} characters</div>
            )}
          </div>

          {/* Controls */}
          <div className="session-controls">
            <div className="controls-group three-col">
              <button
                className={`btn-secondary ${listening ? "btn-recording" : ""}`}
                onClick={startListening}
                disabled={listening || interviewEnded}
              >
                <FaMicrophone className="icon" />
                Start Speaking
              </button>
              <button
                className="btn-danger"
                onClick={stopListening}
                disabled={!listening || interviewEnded}
              >
                <FaStop className="icon" />
                Stop
              </button>
              <button
                className="btn-success"
                onClick={submitAnswer}
                disabled={!userAnswer.trim() || listening || interviewEnded}
              >
                <FaArrowRight className="icon" />
                Submit Answer
              </button>
            </div>

            <div className="controls-group full-width">
              <button
                className="btn-primary"
                onClick={endInterview}
                disabled={interviewEnded}
              >
                <FaFlagCheckered className="icon" />
                End Interview
              </button>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="session-footer">
          <div className="footer-item">
            <FaClipboardList className="icon" />
            <span>Questions Answered: {Math.floor(conversation.length / 2)}</span>
          </div>
          <div className="footer-item">
            <FaStopwatch className="icon" />
            <span className="footer-timer">In Progress</span>
          </div>
        </div>
      </div>
    {showReport && (
      <div className="report-modal-overlay">
        <div className="report-modal">
          {/* Header */}
          <div className="report-modal-header">
            <h2>
              <FaCheckCircle className="report-icon" />
              Interview Report
            </h2>
            <button
              className="close-btn"
              onClick={() => setShowReport(false)}
              title="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="report-modal-content">
            {report}
          </div>

          {/* Footer */}
          <div className="report-modal-footer">
            <button
              onClick={downloadReport}
              className="btn-download"
            >
              <FaFileDownload />
              Download DOCX
            </button>

            <button
              onClick={() => setShowReport(false)}
              className="btn-close-report"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
</div>
  )
}

export default InterviewSession
