import { useState } from "react"

const timetableData = {
"CSE(AI)-A": {
  Monday: [
    { code: "CIR-22LSEF03", subject: "Soft Skills", absentees: ["AIE021", "AIE034"], status: "completed" },
    { code: "22AIE304", subject: "Deep Learning", absentees: ["AIE017"], status: "completed" },
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: [], status: "upcoming" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE305", subject: "Tutorial Hour", absentees: ["AIE009", "AIE041"], status: "upcoming" },
    { code: "", subject: "", absentees: [], status: "completed" } // free hour
  ],

  Tuesday: [
    { code: "22AIE301", subject: "Probabilistic Reasoning", absentees: ["AIE012"], status: "completed" },
    { code: "22AIE304", subject: "Deep Learning", absentees: ["AIE017", "AIE023"], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: [], status: "completed" },
    { code: "22AIE304", subject: "Deep Learning Lab", absentees: ["AIE008"], colSpan: 2, status: "upcoming" }
  ],

  Wednesday: [
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: ["AIE015"], status: "completed" },
    { code: "22AIE305", subject: "DBMS", absentees: [], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "CIR-22LSEF03", subject: "Soft Skills", absentees: [], status: "completed" },
    { code: "22AIE442", subject: "Robotics Lab", absentees: ["AIE029", "AIE031"], colSpan: 2, status: "completed" }
  ],

  Thursday: [
    { code: "22AIE305", subject: "Cloud Computing Lab", absentees: [], colSpan: 2, status: "completed" },
    { code: "22AIE304", subject: "Deep Learning", absentees: [], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE442", subject: "Tutorial Hour", absentees: [], status: "completed" },
    { code: "", subject: "", absentees: [], status: "completed" } // free hour
  ],

  Friday: [
    { code: "22AIE301", subject: "Probabilistic Reasoning", absentees: [], status: "completed" },
    { code: "22AIE442", subject: "Robotics Lab", absentees: [], colSpan: 2, status: "upcoming" },
    { code: "", subject: "LB", absentees: [], status: "upcoming" },
    { code: "CIR-22LSEF01", subject: "Aptitude", absentees: ["AIE021"], status: "upcoming" },
    { code: "CIR-22LSEF02", subject: "Verbal Skills", absentees: [], status: "upcoming" }
  ]
},
"CSE(AI)-B": {
  Monday: [
    { code: "22AIE301", subject: "Probabilistic Reasoning", absentees: ["AIE012"], status: "completed" },
    { code: "22AIE304", subject: "Deep Learning", absentees: ["AIE033"], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: [], status: "upcoming" },
    { code: "22AIE305", subject: "Tutorial", absentees: ["AIE033", "AIE044"], status: "upcoming" },
    { code: "", subject: "", absentees: [], status: "completed" }
  ],

  Tuesday: [
    { code: "22AIE301", subject: "Probabilistic Reasoning", absentees: [], status: "completed" },
    { code: "22AIE305", subject: "Soft Skills", absentees: ["AIE008"], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: [], status: "upcoming" },
    { code: "22AIE304", subject: "Deep Learning Lab", absentees: ["AIE019"], colSpan: 2, status: "upcoming" }
  ],

  Wednesday: [
    { code: "22AIE304", subject: "Deep Learning", absentees: ["AIE033"], status: "completed" },
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: [], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE305", subject: "Soft Skills", absentees: [], status: "completed" },
    { code: "22AIE305", subject: "Tutorial", absentees: ["AIE012", "AIE025"], status: "completed" },
    { code: "", subject: "", absentees: [], status: "completed" }
  ],

  Thursday: [
    { code: "22AIE302", subject: "Formal Language & Automata", absentees: [], status: "completed" },
    { code: "22AIE304", subject: "Deep Learning", absentees: [], status: "completed" },
    { code: "22AIE301", subject: "Probabilistic Reasoning", absentees: ["AIE006"], status: "completed" },
    { code: "", subject: "LB", absentees: [], status: "completed" },
    { code: "22AIE442", subject: "Robotics Lab", absentees: ["AIE012"], colSpan: 2, status: "upcoming" }
  ],

  Friday: [
    { code: "22AIE305", subject: "Soft Skills", absentees: [], status: "completed" },
    { code: "22AIE301", subject: "Probabilistic Reasoning", absentees: [], status: "upcoming" },
    { code: "22AIE304", subject: "Deep Learning", absentees: ["AIE033"], status: "upcoming" },
    { code: "", subject: "LB", absentees: [], status: "upcoming" },
    { code: "22AIE442", subject: "Robotics Lab", absentees: ["AIE033", "AIE044"], colSpan: 2, status: "upcoming" }
  ]
}

}

export default function FacultyDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState(null)

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = ["9:00-9:50", "9:50-10:40", "10:50-11:40", "11:40-12:30", "12:30-1:20", "1:20-2:10"]

  // For demo, showing CSE(AI)-A by default
  const [selectedClass, setSelectedClass] = useState("CSE(AI)-A")
  const timetable = timetableData[selectedClass]

  const getCellStyle = (subject, status) => {
    // LB gets a special color regardless of status
    if (subject === "LB") {
      return { background: '#e3f2fd', color: '#000' }
    }
    
    // Empty periods (free hours)
    if (!subject) {
      return { background: '#fff', color: '#000' }
    }
    
    // Status-based coloring
    if (status === 'completed') {
      return { background: '#90ee90', color: '#000' } // Green
    } else if (status === 'upcoming') {
      return { background: '#e0e0e0', color: '#000' } // Grey
    }
    
    // Default grey for any unspecified status
    return { background: '#e0e0e0', color: '#000' }
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <style>{`
        /* Responsive styles */
        @media (max-width: 768px) {
          .header {
            flex-direction: column !important;
            gap: 15px !important;
          }
          
          .header-nav {
            gap: 20px !important;
            justify-content: center !important;
          }
          
          .header-logo {
            max-width: 150px;
          }
          
          .container {
            padding: 20px 15px !important;
          }
          
          .select-container {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          
          .table-container {
            font-size: 11px !important;
          }
          
          .table-container th,
          .table-container td {
            padding: 8px 4px !important;
            min-width: 80px !important;
            font-size: 10px !important;
          }
          
          .period-code {
            font-size: 9px !important;
          }
          
          .period-subject {
            font-size: 10px !important;
          }
          
          .period-status {
            font-size: 8px !important;
          }
          
          .absentees-panel {
            padding: 20px !important;
          }
          
          .absentees-title {
            font-size: 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          .header {
            padding: 10px 15px !important;
          }
          
          .header-logo {
            max-width: 120px;
          }
          
          .header-nav {
            gap: 15px !important;
          }
          
          .header-nav a {
            font-size: 14px !important;
          }
          
          .table-container {
            font-size: 10px !important;
          }
          
          .table-container th,
          .table-container td {
            padding: 6px 3px !important;
            min-width: 70px !important;
            font-size: 9px !important;
          }
          
          .day-cell {
            min-width: 40px !important;
          }
          
          .period-code {
            font-size: 8px !important;
            margin-bottom: 2px !important;
          }
          
          .period-subject {
            font-size: 9px !important;
          }
          
          .period-status {
            font-size: 7px !important;
            margin-top: 2px !important;
          }
          
          .absentee-item {
            padding: 10px 12px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
      <div className="container" style={{ padding: '30px 40px', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="select-container" style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
        gap: "10px"
        }}>

        <p style={{fontWeight: "bold", margin: 0}}>
            Select Class :
        </p>
        <select
            value={selectedClass}
            onChange={(e) => {
            setSelectedClass(e.target.value)
            setSelectedPeriod(null) // reset absentees view
            }}
            style={{
            padding: "10px 16px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid black",
            cursor: "pointer"
            }}
        >   
            <option value="CSE(AI)-A">CSE(AI) - A</option>
            <option value="CSE(AI)-B">CSE(AI) - B</option>
        </select>
        </div>


        {/* Timetable */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ overflowX: 'auto' }}>
              <table className="table-container" style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                background: 'white',
                fontSize: '13px'
              }}>
                <thead>
                  <tr>
                    <th className="day-cell" style={{
                      border: '2px solid #000',
                      padding: '12px 8px',
                      background: '#f0f0f0',
                      fontWeight: 'bold',
                      minWidth: '60px'
                    }}>Day</th>
                    {timeSlots.map((time, idx) => (
                      <th key={idx} style={{
                        border: '2px solid #000',
                        padding: '12px 8px',
                        background: '#f0f0f0',
                        fontWeight: 'bold',
                        minWidth: '120px'
                      }}>{time}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {daysOfWeek.map((day) => {
                    const dayPeriods = [...timetable[day]] // Create a copy to avoid mutation
                    let timeSlotIndex = 0
                    
                    return (
                      <tr key={day}>
                        <td className="day-cell" style={{
                          border: '2px solid #000',
                          padding: '12px 8px',
                          fontWeight: 'bold',
                          background: '#f0f0f0'
                        }}>{day.slice(0, 3)}</td>
                        {dayPeriods.map((period, periodIdx) => {
                          const cellColSpan = period.colSpan || 1
                          const currentTimeSlot = timeSlots[timeSlotIndex]
                          
                          // Build time range for display (especially for labs)
                          let timeRange = currentTimeSlot
                          if (cellColSpan === 2 && timeSlotIndex + 1 < timeSlots.length) {
                            const endTime = timeSlots[timeSlotIndex + 1].split('-')[1]
                            timeRange = `${currentTimeSlot.split('-')[0]}-${endTime}`
                          }
                          
                          // Increment timeSlotIndex by the colspan
                          timeSlotIndex += cellColSpan
                          
                          return (
                            <td
                              key={periodIdx}
                              colSpan={cellColSpan}
                              onClick={() => period.subject !== "LB" && period.subject && setSelectedPeriod({ ...period, day, time: timeRange })}
                              style={{
                                border: '2px solid #000',
                                padding: '12px 8px',
                                cursor: period.subject && period.subject !== "LB" ? 'pointer' : 'default',
                                ...getCellStyle(period.subject, period.status),
                                transition: 'opacity 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (period.subject && period.subject !== "LB") {
                                  e.currentTarget.style.opacity = '0.8'
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1'
                              }}
                            >
                              <div className="period-code" style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>
                                {period.code}
                              </div>
                              <div className="period-subject" style={{ fontSize: '12px' }}>
                                {period.subject}
                              </div>
                              {period.status === 'completed' && period.subject && period.subject !== 'LB' && (
                                <div className="period-status" style={{ fontSize: '10px', marginTop: '4px', fontStyle: 'italic', color: '#2e7d32' }}>
                                  Completed
                                </div>
                              )}
                              {period.status === 'upcoming' && period.subject && period.subject !== 'LB' && (
                                <div className="period-status" style={{ fontSize: '10px', marginTop: '4px', fontStyle: 'italic', color: '#666' }}>
                                  Upcoming
                                </div>
                              )}
                            </td>
                          )
                        })}
                        {/* Empty cells for remaining time slots */}
                        {Array(Math.max(0, timeSlots.length - timeSlotIndex)).fill(0).map((_, idx) => (
                          <td key={`empty-${idx}`} style={{
                            border: '2px solid #000',
                            padding: '12px 8px',
                            background: '#fff'
                          }}></td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Absentees Panel Below */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div className="absentees-panel" style={{
              background: '#d9d9d9',
              padding: '30px',
              borderRadius: '4px',
              flex: 1
            }}>
              <h2 className="absentees-title" style={{ fontSize: '24px', fontWeight: 500, color: '#333', marginBottom: '20px' }}>
                Absentees
              </h2>



              {!selectedPeriod && (
                <p style={{ color: '#666', fontSize: '16px', marginTop: '20px' }}>
                  Click on any subject in the timetable to view absentees
                </p>
              )}

              {selectedPeriod && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    marginBottom: '25px',
                    paddingBottom: '20px',
                    borderBottom: '2px solid #999'
                  }}>
                    <p style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#333',
                      marginBottom: '8px'
                    }}>{selectedPeriod.subject}</p>
                    <p style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>
                      {selectedPeriod.code}
                    </p>
                    <p style={{ fontSize: '13px', color: '#666' }}>
                      {selectedPeriod.day} • {selectedPeriod.time}
                    </p>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    {selectedPeriod.absentees.length === 0 ? (
                      <p style={{ color: 'black', fontSize: '16px', fontWeight: 500 }}>
                        No absentees
                      </p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedPeriod.absentees.map((roll) => (
                          <li key={roll} className="absentee-item" style={{
                            background: '#fff',
                            padding: '12px 15px',
                            marginBottom: '8px',
                            borderRadius: '4px',
                            fontSize: '15px',
                            color: 'black',
                            borderLeft: '4px solid #9b4444'
                          }}>{roll}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
  )
}


