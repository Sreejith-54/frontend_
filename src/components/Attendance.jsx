import React, { useState, useEffect } from 'react';
import { useAuth } from '../pages/Login/AuthContext';
import './Attendance.css';

export default function Attendance() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [todaySlots, setTodaySlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isFreeHour, setIsFreeHour] = useState(false);
  const [facultyCode, setFacultyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Get current weekday
  const getCurrentDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    return { short: days[today], full: dayNames[today] };
  };

  // Fetch students and timetable on mount
  useEffect(() => {
    fetchStudents();
    fetchTimetable();
  }, []);

  // Filter today's slots when timetable is loaded
  useEffect(() => {
    if (timetableSlots.length > 0) {
      filterTodaySlots();
    }
  }, [timetableSlots]);

  // Fetch students by student ID
  async function fetchStudents() {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/api/cr/students-by-studentid`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
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

  // Fetch timetable for the section
  async function fetchTimetable() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/common/timetable-by-class`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch timetable');
      
      const data = await response.json();
      setTimetableSlots(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter slots for today
  function filterTodaySlots() {
    const currentDay = getCurrentDay().short;
    const todaySlotsData = timetableSlots
      .filter(slot => slot.day === currentDay)
      .sort((a, b) => a.slot_number - b.slot_number);
    
    setTodaySlots(todaySlotsData);
    
    // Auto-select first slot if available
    if (todaySlotsData.length > 0) {
      setSelectedSlot(todaySlotsData[0]);
      setSelectedCourse(todaySlotsData[0].course_code);
    }
  }

  // Handle slot selection (current period)
  function handleSlotChange(slotId) {
    const slot = todaySlots.find(s => s.id === parseInt(slotId));
    setSelectedSlot(slot);
    setSelectedCourse(slot?.course_code || '');
    setIsFreeHour(false);
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

  // Handle free hour toggle
  function handleFreeHourToggle(checked) {
    setIsFreeHour(checked);
    if (checked) {
      // Reset to scheduled course when marking as free
      if (selectedSlot) {
        setSelectedCourse(selectedSlot.course_code);
      }
    }
  }

  // Handle course selection change (for substitution)
  function handleCourseChange(courseCode) {
    setSelectedCourse(courseCode);
  }

  // Check if it's a swap (different from scheduled course)
  const isSwap = selectedSlot && selectedCourse && selectedCourse !== selectedSlot.course_code;

  // Filters
  const absentees = students.filter((s) => s.status === 'absent');
  const lateComers = students.filter((s) => s.status === 'late');

  // Submit attendance
  async function handleSubmit() {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    if (!facultyCode.trim()) {
      alert('Please enter faculty code');
      return;
    }

    if (!selectedCourse && !isFreeHour) {
      alert('Please select a course');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const records = students.map(student => ({
        id: student.id,
        status: student.status
      }));

      const today = new Date().toISOString().split('T')[0];

      // Determine which course to send
      const courseToSend = isFreeHour ? selectedSlot.course_code : selectedCourse;

      // Find the timetable slot for the selected course (for verification)
      const verificationSlot = isFreeHour 
        ? selectedSlot 
        : timetableSlots.find(slot => slot.course_code === selectedCourse) || selectedSlot;

      // Submit attendance
      const response = await fetch(`${API_URL}/api/cr/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timetable_id: selectedSlot.id,
          date: today,
          records: records,
          selected_course_code: courseToSend,
          is_free: isFreeHour
        })
      });

      if (!response.ok) throw new Error('Failed to submit attendance');

      const data = await response.json();
      const newSessionId = data.sessionId;

      // Verify with faculty code
      const verifyResponse = await fetch(`${API_URL}/api/faculty/verify/${newSessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: facultyCode,
          timetable_id: verificationSlot.id // ✅ Send the timetable ID of actual course
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || 'Invalid faculty code');
      }

      alert('Attendance Submitted and Verified Successfully!');
      
      // Reset form
      setFacultyCode('');
      setIsFreeHour(false);
      if (selectedSlot) {
        setSelectedCourse(selectedSlot.course_code);
      }
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
          <div className="table-wrapper">
            <div className='icon' style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <div className='present'>Present</div>
                <div className='absent'>Absent</div>
                <div className='late'>Late</div>
              </div>
            <table className="stu-table">
              <tbody className='grid'>
                {students.length === 0 ? (
                  <tr><td colSpan="1" style={{ textAlign: 'center', padding: '20px' }}>
                    No students found.
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
              type="password"
              placeholder="Enter faculty code"
              value={facultyCode}
              onChange={(e) => setFacultyCode(e.target.value)}
              className="input"
              maxLength={6}
              autoComplete="off"
            />
          </label>

          <label className="label">
            Select Current Period
            <select 
              value={selectedSlot?.id || ''} 
              onChange={(e) => handleSlotChange(e.target.value)}
              disabled={todaySlots.length === 0}
            >
              {todaySlots.length === 0 ? (
                <option>No classes today</option>
              ) : (
                todaySlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    Slot {slot.slot_number} - {slot.course_name} ({slot.course_code})
                  </option>
                ))
              )}
            </select>
          </label>

          {/* FREE HOUR TOGGLE */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFreeHour}
                onChange={(e) => handleFreeHourToggle(e.target.checked)}
                disabled={!selectedSlot}
              />
              <span style={{ fontWeight: 'bold', color: '#AD3A3C' }}>Mark as Free Hour</span>
            </label>
          </div>

          {!isFreeHour && selectedSlot && (
            <>
              <label className="label">
                Actual Course Conducted (Optional - for substitution)
                <select 
                  value={selectedCourse} 
                  onChange={(e) => handleCourseChange(e.target.value)}
                  disabled={!selectedSlot}
                >
                  <option value="">Select Course...</option>
                  {timetableSlots
                    .filter((slot, index, self) => 
                      index === self.findIndex(s => s.course_code === slot.course_code)
                    )
                    .sort((a, b) => a.course_name.localeCompare(b.course_name))
                    .map((slot) => (
                      <option key={slot.course_code} value={slot.course_code}>
                        {slot.course_name} ({slot.course_code})
                      </option>
                    ))}
                </select>
              </label>

              {isSwap && (
                <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '5px', marginBottom: '10px' }}>
                  <strong>⚠️ Course Swap Detected</strong>
                  <div style={{ fontSize: '0.9rem' }}>
                    Scheduled: {selectedSlot.course_name}<br/>
                    Conducting: {timetableSlots.find(s => s.course_code === selectedCourse)?.course_name}
                  </div>
                </div>
              )}
            </>
          )}

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
            disabled={loading || !selectedSlot || !facultyCode.trim() || (!isFreeHour && !selectedCourse)}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
