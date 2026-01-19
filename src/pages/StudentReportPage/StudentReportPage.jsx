import StudentReportComponent from "../../components/StudentReportComponent.jsx";
import StudentReportCalender from '../../components/StudentReportCalender.jsx';
import React, { useState, useEffect } from 'react';
import './StudentReportPage.css';

const StudentReport = (props) => {
  const [rawRecords, setRawRecords] = useState([]); 
  const [summaryData, setSummaryData] = useState([]); 
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!props.RollNo) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-report?roll_number=${props.RollNo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        if (response.ok) {
          setRawRecords(data);

          const grouped = data.reduce((acc, curr) => {
            const course = curr.course_name;
            if (!acc[course]) {
              acc[course] = { attended: 0, total: 0, code: curr.course_code || 'N/A' };
            }
            acc[course].total += 1;
            if (curr.attendance_status?.toLowerCase() === 'present') {
              acc[course].attended += 1;
            }
            return acc;
          }, {});

          const formattedSummary = Object.keys(grouped).map((courseName) => ({
            courseID: grouped[courseName].code,
            Subject: courseName,
            Attendence: grouped[courseName].attended,
            totalClasses: grouped[courseName].total
          }));

          setSummaryData(formattedSummary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [props.RollNo]);

  return (
    <div className="StudentReportPage">
      <main>
        {/* TOP HEADER - DROPDOWN REMOVED */}
        <div className='opt' style={headerContainerStyle}>
          <div className='details' style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <p>Name : {props.StudentName}</p>
            <p>Roll No : {props.RollNo}</p>
          </div>
        </div>

        <div className='cards' style={{ margin: '30px auto', width: '97%' }}>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading Report...</p>
          ) : (
            /* SHOWING SUMMARY TABLE ONLY AS DROPDOWN IS GONE */
            <div className='student-details' style={cardContainerStyle}>
              <table border={0} style={{ width: '90%', borderCollapse: 'separate', borderSpacing: '3px 10px' }}>
                <thead>
                  <tr style={{ height: '7vh', fontSize: '2vh' }}>
                    <th>CourseID</th>
                    <th>Subject</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((item, index) => (
                    <StudentReportComponent
                      key={index}
                      courseID={item.courseID}
                      Subject={item.Subject}
                      Attendence={item.Attendence}
                      totalClasses={item.totalClasses}
                      /* Optional: Add an onClick here if you want to select a subject by clicking the row instead */
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const headerContainerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  backgroundColor: '#f0f0f0', 
  margin: '30px 20px', 
  padding: '40px 20px', 
  borderRadius: '8px' 
};

const cardContainerStyle = { 
  backgroundColor: '#f0f0f0', 
  margin: '30px auto', 
  borderRadius: '8px', 
  textAlign: 'center', 
  display: 'flex', 
  justifyContent: 'center', 
  padding: '20px' 
};

export default StudentReport;
