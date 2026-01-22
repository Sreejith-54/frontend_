import StudentReportComponent from "../../components/StudentReportComponent.jsx";
import React, { useState, useEffect } from 'react';
import './StudentReportPage.css';

const StudentReport = (props) => {
  const [summaryData, setSummaryData] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!props.RollNo) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        
        // First, get student details to find section_id and semester
        const studentResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const students = await studentResponse.json();
        const student = students.find(s => s.roll_number === props.RollNo);
        
        if (!student) {
          setError("Student not found");
          setLoading(false);
          return;
        }

        // Get courses for this section
        const coursesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const allCourses = await coursesResponse.json();

        // Get timetable to find which courses this student has
        const timetableResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/common/timetable?section_id=${student.section_id}&semester=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const timetable = await timetableResponse.json();
        
        // Get unique course codes from timetable
        const courseCodes = [...new Set(timetable.map(t => t.course_code))];

        // For each course, fetch attendance data using periodic endpoint
        // We'll use the current month, but the endpoint returns total attendance too
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        
        const attendancePromises = courseCodes.map(async (courseCode) => {
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/attendance/periodic?sectionId=${student.section_id}&semester=1&courseCode=${courseCode}&month=${currentMonth}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            if (!response.ok) return null;
            
            const data = await response.json();
            
            // Find this student's data
            const studentData = data.find(d => d.studentName === props.RollNo);
            
            if (studentData) {
              const course = allCourses.find(c => c.course_code === courseCode);
              return {
                courseID: courseCode,
                Subject: course ? course.course_name : courseCode,
                Attendence: studentData.totalAttended,
                totalClasses: studentData.totalClasses,
                percentage: studentData.overallPercentage
              };
            }
            return null;
          } catch (err) {
            console.error(`Error fetching attendance for ${courseCode}:`, err);
            return null;
          }
        });

        const results = await Promise.all(attendancePromises);
        const validResults = results.filter(r => r !== null && r.totalClasses > 0);
        
        setSummaryData(validResults);
        
      } catch (err) {
        console.error(err);
        setError("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [props.RollNo]);

  return (
    <div className="StudentReportPage">
      <main>
        <div className='opt' style={headerContainerStyle}>
          <div className='details' style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <p>Name : {props.StudentName}</p>
            <p>Roll No : {props.RollNo}</p>
          </div>
        </div>

        <div className='cards' style={{ margin: '30px auto', width: '97%' }}>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading Report...</p>
          ) : error ? (
            <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
          ) : summaryData.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No attendance data available</p>
          ) : (
            <div className='student-details' style={cardContainerStyle}>
              <table border={0} style={{ width: '90%', borderCollapse: 'separate', borderSpacing: '3px 10px' }}>
                <thead>
                  <tr style={{ height: '7vh', fontSize: '2vh' }}>
                    <th>CourseID</th>
                    <th>Subject</th>
                    <th>Classes Attended</th>
                    <th>Total Classes</th>
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