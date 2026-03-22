import React, { useState, useEffect } from "react";
import "../styles/interview.scss";
import { useInterview } from "../hooks/useInterview";
import { useParams } from "react-router";

const NAV_ITEMS = [
  { id: "technical", label: "Technical Questions" },
  { id: "behavioral", label: "Behavioral Questions" },
  { id: "roadmap", label: "Road Map" },
];

const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="q-card">
      <div className="q-card__header" onClick={() => setOpen(!open)}>
        <span className="q-card__index">Q{index + 1}</span>
        <p className="q-card__question">{item?.question}</p>
        <span className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {open && (
        <div className="q-card__body">
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--intention">Intention</span>
            <p>{item?.intention}</p>
          </div>
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--answer">Answer</span>
            <p>{item?.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const { report, loading, getReportById ,generateResumePdf} = useInterview();
  const { interviewId } = useParams();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [interviewId]);

  if (loading || !report) {
    return (
      <main className="loading-screen">
        <h1>Loading interview...</h1>
      </main>
    );
  }

  const technicalQuestions = report?.technicalQuestions || [];
  const behavioralQuestions = report?.behavioralQuestions || [];
  const preparationPlan = report?.preparationPlan || [];
  const skillGaps = report?.skillGapAnalysis || []; // ✅ Updated key

  // Calculate match score class
  const getScoreClass = (score) => {
    if (score >= 70) return "score--high";
    if (score >= 40) return "score--mid";
    return "score--low";
  };

  return (
    <div className="interview-page">
      <div className="interview-layout">
        {/* Left Navigation */}
        <nav className="interview-nav">
          <div className="interview-nav__label">SECTIONS</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="interview-nav__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {item.id === "technical" && (
                    <path d="M8 9l3-3 3 3m0 6l-3 3-3-3" />
                  )}
                  {item.id === "behavioral" && (
                    <path d="M12 8v8m-4-4h8" />
                  )}
                  {item.id === "roadmap" && (
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  )}
                </svg>
              </span>
              {item.label}
            </button>
          ))}
          <button className="button primary-button"
onClick={() => generateResumePdf({ interviewReportId: interviewId })}          >
            <svg height={'0.8rem'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956C10.277 18.5682 9.20776 18.5682 8.8704 17.7956L7.99275 15.7854C7.21171 13.9966 5.80589 12.5726 4.0523 11.7942L1.63658 10.7219C.868536 10.381.868537 9.26368 1.63658 8.92276L3.97685 7.88394C5.77553 7.08552 7.20657 5.60881 7.97427 3.75892L8.8633 1.61673C9.19319.821767 10.2916.821765 10.6215 1.61673L11.5105 3.75894C12.2782 5.60881 13.7092 7.08552 15.5079 7.88394L17.8482 8.92276C18.6162 9.26368 18.6162 10.381 17.8482 10.7219L15.4325 11.7942C13.6789 12.5726 12.2731 13.9966 11.492 15.7854L10.6144 17.7956ZM4.53956 9.82234C6.8254 10.837 8.68402 12.5048 9.74238 14.7996 10.8008 12.5048 12.6594 10.837 14.9452 9.82234 12.6321 8.79557 10.7676 7.04647 9.74239 4.71088 8.71719 7.04648 6.85267 8.79557 4.53956 9.82234ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899ZM18.3745 19.0469 18.937 18.4883 19.4878 19.0469 18.937 19.5898 18.3745 19.0469Z"></path></svg>
            Generate Ai Resume PDF</button>
        </nav>

        <div className="interview-divider" />

        {/* Main Content */}
        <main className="interview-content">
          <section>
            <div className="content-header">
              <h2>
                {activeNav === "technical" && "Technical Questions"}
                {activeNav === "behavioral" && "Behavioral Questions"}
                {activeNav === "roadmap" && "Preparation Plan"}
              </h2>
              <span className="content-header__count">
                {activeNav === "technical" && technicalQuestions.length}
                {activeNav === "behavioral" && behavioralQuestions.length}
                {activeNav === "roadmap" && preparationPlan.length}
              </span>
            </div>

            {activeNav === "technical" && (
              <div className="q-list">
                {technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            )}

            {activeNav === "behavioral" && (
              <div className="q-list">
                {behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            )}

            {activeNav === "roadmap" && (
              <div className="roadmap-list">
                {preparationPlan.map((day, i) => (
                  <div key={i} className="roadmap-day">
                    <div className="roadmap-day__header">
                      <span className="roadmap-day__badge">Day {day.day}</span>
                    </div>
                    <h3 className="roadmap-day__focus">Focus: {day.focus || "Core Concepts"}</h3>
                    <ul className="roadmap-day__tasks">
                      {(day.tasks || []).map((task, t) => (
                        <li key={t}>
                          <span className="roadmap-day__bullet" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <div className="interview-divider" />

        {/* Right Sidebar */}
        <aside className="interview-sidebar">
          <div className="match-score">
            <p className="match-score__label">Match Score</p>
            <div className={`match-score__ring ${getScoreClass(report?.matchScore || 0)}`}>
              <span className="match-score__value">{report?.matchScore || 0}</span>
              <span className="match-score__pct">%</span>
            </div>
            <p className="match-score__sub">
              {report?.matchScore >= 70 ? "Strong Match" : 
               report?.matchScore >= 40 ? "Moderate Match" : "Needs Work"}
            </p>
          </div>

          <div className="sidebar-divider" />

          <div className="skill-gaps">
            <p className="skill-gaps__label">Skill Gaps</p>
            <div className="skill-gaps__list">
              {skillGaps.length > 0 ? (
                skillGaps.map((gap, i) => (
                  <span
                    key={i}
                    className={`skill-tag skill-tag--${gap.severity || "medium"}`}
                  >
                    {gap.skill || "Unknown Skill"}
                  </span>
                ))
              ) : (
                <p className="skill-gaps__empty">No skill gaps identified</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;