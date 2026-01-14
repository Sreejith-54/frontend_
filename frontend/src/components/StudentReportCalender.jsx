import React from 'react'
import "./StudentReportCalendar.css"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
const attendanceEvent = [
  // Week 1
  { title: "Present", start: "2025-12-01T09:05:00" },
  { title: "Absent",  start: "2025-12-01T14:00:00" },

  { title: "Present", start: "2025-12-02T09:05:00" },
  { title: "Present", start: "2025-12-02T10:50:00" },

  { title: "Absent",  start: "2025-12-03T09:05:00" },
  { title: "Present", start: "2025-12-03T14:00:00" },

  { title: "Present", start: "2025-12-04T09:05:00" },
  { title: "Absent",  start: "2025-12-04T10:50:00" },

  { title: "Present", start: "2025-12-05T09:05:00" },
  { title: "Present", start: "2025-12-05T14:00:00" },

  // Week 2
  { title: "Absent",  start: "2025-12-08T09:05:00" },
  { title: "Present", start: "2025-12-08T10:50:00" },

  { title: "Present", start: "2025-12-09T09:05:00" },
  { title: "Absent",  start: "2025-12-09T14:00:00" },

  { title: "Present", start: "2025-12-10T09:05:00" },
  { title: "Present", start: "2025-12-10T10:50:00" },

  { title: "Absent",  start: "2025-12-11T09:05:00" },
  { title: "Present", start: "2025-12-11T14:00:00" },

  { title: "Present", start: "2025-12-12T09:05:00" },
  { title: "Absent",  start: "2025-12-12T10:50:00" },

  // Week 3
  { title: "Present", start: "2025-12-15T09:05:00" },
  { title: "Present", start: "2025-12-15T14:00:00" },

  { title: "Absent",  start: "2025-12-16T09:05:00" },
  { title: "Present", start: "2025-12-16T10:50:00" },

  { title: "Present", start: "2025-12-17T09:05:00" },
  { title: "Absent",  start: "2025-12-17T14:00:00" },

  { title: "Present", start: "2025-12-18T09:05:00" },
  { title: "Present", start: "2025-12-18T10:50:00" },

  { title: "Absent",  start: "2025-12-19T09:05:00" },
  { title: "Present", start: "2025-12-19T14:00:00" },

  // Week 4
  { title: "Present", start: "2025-12-22T09:05:00" },
  { title: "Absent",  start: "2025-12-22T10:50:00" },

  { title: "Present", start: "2025-12-23T09:05:00" },
  { title: "Present", start: "2025-12-23T14:00:00" },

  { title: "Absent",  start: "2025-12-24T09:05:00" },
  { title: "Present", start: "2025-12-24T10:50:00" },

  { title: "Present", start: "2025-12-25T09:05:00" },
  { title: "Absent",  start: "2025-12-25T14:00:00" },

  { title: "Present", start: "2025-12-26T09:05:00" },
  { title: "Present", start: "2025-12-26T10:50:00" },

  // Week 5
  { title: "Absent",  start: "2025-12-29T09:05:00" },
  { title: "Present", start: "2025-12-29T14:00:00" },

  { title: "Present", start: "2025-12-30T09:05:00" },
  { title: "Absent",  start: "2025-12-30T10:50:00" },

  { title: "Present", start: "2025-12-31T09:05:00" },
  { title: "Present", start: "2025-12-31T14:00:00" }
];


const StudentReportCalender = (props) => {
const [attendanceEvents, setAttendanceEvents] = React.useState([]);
const [subject, setSubject] = React.useState('');

async function fetchAttendanceData() {
    console.log("Subject in Calendar:",subject);
}

React.useEffect(() => {
    setAttendanceEvents(attendanceEvent);
    setSubject(props.subject);
    fetchAttendanceData();
}, [props.subject]);
return (
<div>
    <FullCalendar
    height={'100vh'}
    plugins={[dayGridPlugin]}
    initialView="dayGridMonth"
    events={attendanceEvents}
    eventOrder="start"
    dayMaxEvents={4}
    eventClassNames={(args)=>{
        if (args.event.title === 'Present')
            return ["Present-box"];
        if (args.event.title === 'Absent')
            return ["Absent-box"];
    }}
    displayEventTime={true}
    eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: true
    }}
    />
</div>
)
}

export default StudentReportCalender