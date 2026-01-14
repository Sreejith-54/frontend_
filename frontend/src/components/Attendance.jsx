import React, { useState, useEffect } from 'react';
import { useAuth } from '..';
import './Attendance.css';

export default function Attendance() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  
  const [klass, setKlass] = useState('');
  const [facultyCode, setFacultyCode] = useState('');
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTimetableId, setSelectedTimetableId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timetable, setTimeTable] = useState('Show');
  const [sessionId, setSessionId] = useState(null);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch students when course/timetable is selected
  useEffect(() => {
    if (selectedTimetableId) {
      fetchStudents(selectedTimetableId);
    }
  }, [selectedTimetableId]);

  // Fetch CR's courses
  async function fetchCourses() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/cr/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch courses');
      
      const data = await response.json();
      setCourses(data);
      
      // Set first course as default
      if (data.length > 0) {
        setKlass(data[0].course_code);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }

  // Fetch students for selected timetable
  async function fetchStudents(ttId) {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/cr/students-by-timetable/${ttId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch students');
      
      const data = await response.json();
      // Initialize all students as present
      const studentsWithStatus = data.map(student => ({
        ...student,
        status: 'present'
      }));
      setStudents(studentsWithStatus);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle course selection - you'll need to implement logic to get timetable_id
  // This is a simplified version - you may need to fetch timetable data or pass it differently
  function handleCourseChange(courseCode) {
    setKlass(courseCode);
    // TODO: You need to determine the timetable_id for this course
    // This might require an additional API call or timetable selection UI
    // For now, you'll need to implement this based on your timetable structure
    
    // Example placeholder - replace with actual logic:
    // setSelectedTimetableId(some_timetable_id_for_this_course);
  }

  // Toggle attendance status
  function toggleAttendance(id) {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id !== id) return st;

        const nextStatus =
          st.status === 'present'
            ? 'absent'
            : st.status === 'absent'
            ? 'late'
            : 'present';

        return { ...st, status: nextStatus };
      })
    );
  }

  // Filters
  const absentees = students.filter((s) => s.status === 'absent');
  const lateComers = students.filter((s) => s.status === 'late');

  function handletable() {
    timetable === 'Show'
      ? setTimeTable('Hide')
      : setTimeTable('Show');
  }

  // Submit attendance
  async function handleSubmit() {
    if (!selectedTimetableId) {
      alert('Please select a valid course/timetable slot');
      return;
    }

    if (!facultyCode.trim()) {
      alert('Please enter faculty code');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare attendance records
      const records = students.map(student => ({
        id: student.id,
        status: student.status
      }));

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Submit attendance
      const response = await fetch(`${API_URL}/api/cr/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timetable_id: selectedTimetableId,
          date: today,
          records: records,
          selected_course_code: klass,
          is_free: false
        })
      });

      if (!response.ok) throw new Error('Failed to submit attendance');

      const data = await response.json();
      const newSessionId = data.sessionId;
      setSessionId(newSessionId);

      // Now verify with faculty code
      const verifyResponse = await fetch(`${API_URL}/api/faculty/verify/${newSessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: facultyCode
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Invalid faculty code');
      }

      alert('Attendance Submitted and Verified Successfully!');
      
      // Reset form
      setFacultyCode('');
      // Optionally reset students to all present
      setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));

    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
      console.error('Error submitting attendance:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="attendance-page">
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-overlay">Loading...</div>}
      
      <div className="attendance-wrapper">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div>
            <button 
              onClick={() => handletable()} 
              style={{ backgroundColor: '#AD3A3C', color: 'white', padding: '10px', marginBottom: '10px' }}
            >
              {`${timetable} Time Table`}
            </button>
          </div>
          {timetable === 'Hide' &&
            <div className='title'>Time Table</div>}
          <div className="table-wrapper">
            <table className="stu-table">
              <div className='icon' style={{ display: 'flex', gap: '10px' }}>
                <div className='present'>Present</div>
                <div className='absent'>Absent</div>
                <div className='late'>Late</div>
              </div>
              <tbody className='grid'>
                {students.length === 0 ? (
                  <tr><td colSpan="1" style={{ textAlign: 'center', padding: '20px' }}>
                    No students found. Please select a course.
                  </td></tr>
                ) : (
                  students.map((st) => (
                    <tr
                      style={{ minWidth: '70px' }}
                      key={st.id}
                      className={`row ${st.status}`}
                      onClick={() => toggleAttendance(st.id)}
                      title="Click to change status"
                    >
                      <td>
                        <span className='roll-class'>{st.roll_number?.slice(-8, -3) || st.roll_number}</span>
                        <br />
                        <span style={{ fontWeight: '700', fontSize: 'xx-large' }}>
                          {st.roll_number?.slice(-3) || st.roll_number}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <label className="label">
            Faculty Code
            <input
              type="text"
              placeholder="Enter faculty code"
              value={facultyCode}
              onChange={(e) => setFacultyCode(e.target.value)}
              className="input"
              maxLength={6}
            />
          </label>

          <label className="label">
            Select Subject
            <select 
              value={klass} 
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={courses.length === 0}
            >
              {courses.length === 0 ? (
                <option>Loading courses...</option>
              ) : (
                courses.map((course) => (
                  <option key={course.course_code} value={course.course_code}>
                    {course.course_name}
                  </option>
                ))
              )}
            </select>
          </label>

          {/* LATE COMERS */}
          <div className="late-box">
            <h4>Late Comers</h4>
            {lateComers.length === 0 ? (
              <p className="none">None</p>
            ) : (
              lateComers.map((s) => (
                <div key={s.id} className="late-name">
                  {s.roll_number?.slice(-3) || s.roll_number}
                </div>
              ))
            )}
          </div>

          {/* ABSENTEES */}
          <div className="absentees">
            <h4>Absentees</h4>
            {absentees.length === 0 ? (
              <p className="none">None</p>
            ) : (
              absentees.map((s) => (
                <div key={s.id} className="absent-name">
                  {s.roll_number?.slice(-3) || s.roll_number}
                </div>
              ))
            )}
          </div>

          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={loading || !selectedTimetableId || !facultyCode.trim()}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}