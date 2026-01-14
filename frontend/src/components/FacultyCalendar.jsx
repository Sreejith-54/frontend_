import { useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"

const FacultyCalendar = () => {
  const [events] = useState([])

  const attendanceRecords = [
    { date: "2026-01-01", periods: [{ status: "P", time: "08:00 AM" }] },
    { date: "2026-01-02", periods: [{ status: "P", time: "08:00 AM" }, { status: "A", time: "02:00 PM" }] },
    { date: "2026-01-03", periods: [{ status: "A", time: "08:00 AM" }] },
    { date: "2026-01-04", periods: [{ status: "A", time: "08:00 AM" }] },
    { date: "2026-01-05", periods: [{ status: "P", time: "08:00 AM" }] },
    { date: "2026-01-06", periods: [{ status: "L", time: "08:00 AM" }] },
    { date: "2026-01-07", periods: [{ status: "P", time: "08:00 AM" }, { status: "P", time: "11:00 AM" }, { status: "A", time: "02:00 PM" }] },
    { date: "2026-01-08", periods: [{ status: "A", time: "08:00 AM" }] },
    { date: "2026-01-09", periods: [{ status: "P", time: "08:00 AM" }] },
    { date: "2026-01-10", periods: [{ status: "L", time: "08:00 AM" }] },
  ]

  return (
    <div style={{ 
      padding: 'clamp(0.75rem, 3vw, 2rem)',
      height: '100vh',
      overflow: 'auto',
      boxSizing: 'border-box'
    }}>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .fc {
            font-size: clamp(0.75rem, 2vw, 1rem);
          }

          .fc-daygrid-day-top {
            font-size: clamp(0.9rem, 2.5vw, 1.2rem);
            font-weight: 600;
            padding: clamp(0.25rem, 1vw, 0.5rem);
          }

          .fc-toolbar-title {
            font-size: clamp(1rem, 4vw, 1.75rem) !important;
            font-weight: 600;
          }

          .fc-toolbar {
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem !important;
          }

          .fc-toolbar-chunk {
            display: flex;
            gap: 0.25rem;
          }

          .fc-button {
            padding: clamp(0.25rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 1rem) !important;
            font-size: clamp(0.7rem, 2vw, 1rem) !important;
            min-height: 36px;
            touch-action: manipulation;
          }

          .fc-daygrid-day {
            padding: 0.125rem;
            position: relative;
          }

          .fc-daygrid-day-frame {
            min-height: clamp(60px, 12vh, 120px);
            position: relative;
          }

          .fc .fc-daygrid-day-number {
            font-size: clamp(0.75rem, 2vw, 1.1rem);
            position: relative;
            z-index: 2;
            padding: clamp(0.2rem, 1vw, 0.4rem);
          }

          .fc-col-header-cell {
            padding: clamp(0.375rem, 1.5vw, 0.75rem) clamp(0.125rem, 1vw, 0.5rem);
            font-size: clamp(0.7rem, 2vw, 1.1rem);
            font-weight: 600;
          }

          .fc-daygrid-day-events {
            display: none;
          }

          .attendance-periods {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            z-index: 1;
          }

          .period-block {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            position: relative;
          }

          .period-block:not(:last-child) {
            border-right: 1px solid black;
          }

          .period-block.present {
            background-color: #229853;
          }

          .period-block.late {
            background-color: #f39c12;
          }

          .period-block.absent {
            background-color: #e14635;
          }

          .period-time {
            color: black;
            font-size: clamp(0.55rem, 1.5vw, 0.75rem);
            font-weight: 500;
            margin-top: auto;
            padding: clamp(0.15rem, 0.5vw, 0.25rem);
            text-align: center;
            line-height: 1.2;
          }

          .fc-daygrid-day.has-attendance .fc-daygrid-day-number {
            color: white !important;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          }

          /* Mobile optimizations */
          @media (max-width: 768px) {
            .fc-toolbar {
              justify-content: center;
            }

            .fc-toolbar-chunk {
              justify-content: center;
            }

            .fc-header-toolbar {
              margin-bottom: 0.75rem !important;
            }

            .fc-col-header-cell-cushion {
              padding: 0.25rem !important;
            }
          }

          /* Extra small screens */
          @media (max-width: 480px) {
            .fc-toolbar {
              margin-bottom: 0.5rem !important;
            }

            .fc-button-group {
              display: flex;
            }

            .fc-daygrid-day-frame {
              min-height: 50px;
            }

            /* Hide "AM/PM" on very small screens to save space */
            .period-time {
              font-size: 0.5rem;
            }

            /* Stack toolbar on very small screens */
            .fc-toolbar {
              flex-direction: column;
            }

            .fc-toolbar-chunk:nth-child(2) {
              order: -1;
              margin-bottom: 0.5rem;
            }
          }

          /* Landscape mobile */
          @media (max-width: 896px) and (orientation: landscape) {
            .fc-daygrid-day-frame {
              min-height: 70px;
            }

            .period-time {
              font-size: 0.6rem;
            }
          }

          /* Touch-friendly improvements */
          @media (hover: none) and (pointer: coarse) {
            .fc-button {
              min-height: 44px;
              min-width: 44px;
            }

            .fc-daygrid-day {
              cursor: pointer;
            }
          }
        `}
      </style>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height="auto"
        contentHeight="auto"
        aspectRatio={1.5}
        events={events}
        displayEventTime={false}
        headerToolbar={{
          left: 'prev,next',
          center: 'title',
          right: 'today'
        }}
        dayCellClassNames={(arg) => {
          const dateStr = arg.date.toISOString().split('T')[0]
          const record = attendanceRecords.find(r => r.date === dateStr)
          if (record && record.periods.length > 0) {
            return ["has-attendance"]
          }
          return []
        }}
        dayCellDidMount={(arg) => {
          const dateStr = arg.date.toISOString().split('T')[0]
          const record = attendanceRecords.find(r => r.date === dateStr)
          
          if (record && record.periods.length > 0) {
            const periodsContainer = document.createElement('div')
            periodsContainer.className = 'attendance-periods'
            
            record.periods.forEach(period => {
              const periodBlock = document.createElement('div')
              periodBlock.className = `period-block ${
                period.status === 'P' ? 'present' : 
                period.status === 'L' ? 'late' : 'absent'
              }`
              
              const timeLabel = document.createElement('div')
              timeLabel.className = 'period-time'
              timeLabel.textContent = period.time
              
              periodBlock.appendChild(timeLabel)
              periodsContainer.appendChild(periodBlock)
            })
            
            arg.el.querySelector('.fc-daygrid-day-frame').appendChild(periodsContainer)
          }
        }}
      />
    </div>
  )
}

export default FacultyCalendar
