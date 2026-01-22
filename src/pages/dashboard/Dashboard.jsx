import { useState, useEffect } from "react";
import api from "../utils/api";
import "./dashboard1.css";

export default function MonthlyAttendanceDashboard() {
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  const [deptId, setDeptId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [semester, setSemester] = useState("");
  const [courseCode, setCourseCode] = useState("");
  
  const today = new Date();
  const defaultMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  const [month, setMonth] = useState(defaultMonth);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= DROPDOWNS ================= */

  useEffect(() => {
    api.get("/admin/depts").then(res => setDepts(res.data));
  }, []);

  useEffect(() => {
    if (!deptId) return setBatches([]);
    api.get("/admin/batches")
      .then(res => setBatches(res.data.filter(b => b.dept_id === +deptId)));
  }, [deptId]);

  useEffect(() => {
    if (!batchId) return setSections([]);
    api.get("/admin/sections")
      .then(res => setSections(res.data.filter(s => s.batch_id === +batchId)));
  }, [batchId]);

  useEffect(() => {
    if (!sectionId || !semester) {
      setCourses([]);
      return;
    }
  
    api.get("/common/timetable", {
      params: { section_id: sectionId, semester }
    }).then(res => {
      const uniqueCourses = [];
      const seen = new Set();
      res.data.forEach(slot => {
        if (!seen.has(slot.course_code)) {
          seen.add(slot.course_code);
          uniqueCourses.push({
            course_code: slot.course_code,
            course_name: slot.course_name
          });
        }
      });
      setCourses(uniqueCourses);
    });
  }, [sectionId, semester]);

  /* ================= FETCH ATTENDANCE ================= */

  const fetchAttendance = async () => {
    if (!sectionId || !semester || !courseCode || !month) {
      alert("Select all fields");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      alert("Month must be in YYYY-MM format");
      return;
    }

    setLoading(true);
    setData([]);

    try {
      const res = await api.get("/attendance/periodic", {
        params: {
          sectionId: Number(sectionId),
          semester: Number(semester),
          courseCode: courseCode,
          month: month
        }
      });
      setData(res.data);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      alert(err.response?.data?.error || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const headerRecords = data.length > 0 ? data[0].records : [];

  return (
    <div className="monthly-attendance">

      {/* FILTER BAR */}
      <div className="filters">
        <select onChange={e => setDeptId(e.target.value)} value={deptId}>
          <option value="">Dept</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
        </select>

        <select onChange={e => setBatchId(e.target.value)} value={batchId} disabled={!deptId}>
          <option value="">Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
        </select>

        <select onChange={e => setSectionId(e.target.value)} value={sectionId} disabled={!batchId}>
          <option value="">Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
        </select>

        <select onChange={e => setSemester(e.target.value)} value={semester}>
          <option value="">Semester</option>
          {[1,2,3,4,5,6,7,8].map(n => (
            <option key={n} value={n}>Sem {n}</option>
          ))}
        </select>

        <select onChange={e => setCourseCode(e.target.value)} value={courseCode} disabled={!semester}>
          <option value="">Course</option>
          {courses.map(c => (
            <option key={c.course_code} value={c.course_code}>
              {c.course_name}
            </option>
          ))}
        </select>

        <input 
          type="month" 
          value={month} 
          onChange={e => setMonth(e.target.value)}
          max={defaultMonth}
        />

        <button className="fetch-btn" onClick={fetchAttendance}>Fetch</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* HEADER ROW */}
      {data.length > 0 && (
        <div className="attendance-row header">
          <div className="student-name">Student</div>
          
          <div className="attendance-days header-scroll">
            {headerRecords.map((rec, idx) => {
              const dateObj = new Date(rec.date);
              const day = dateObj.getDate();
              return (
                <div key={idx} className="date-header-cell">
                  <span className="date-num">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="attendance-summary">Monthly</div>
          <div className="attendance-summary total-col">Total Attended</div>
          <div className="attendance-summary total-col">Overall %</div>
        </div>
      )}

      {/* DATA ROWS */}
      {data.map((s, i) => {
        const monthlyTotal = s.records.length;
        
        // ✅ Both 'present' AND 'late' count as attended
        const monthlyAttended = s.records.filter(r => 
          r.status.toLowerCase() === 'present' || 
          r.status.toLowerCase() === 'late'
        ).length;
        
        const monthlyPercentage = monthlyTotal > 0 
          ? ((monthlyAttended / monthlyTotal) * 100).toFixed(0) 
          : 0;

        // Get overall data from API
        const overallTotal = s.totalClasses ?? 0;
        const overallAttended = s.totalAttended ?? 0;
        const overallPercentage = s.overallPercentage ?? 0;

        const getColor = (pct) => {
          if (pct < 75) return '#eb8888';
          if (pct < 85) return '#f1d780';
          return '#d4edda';
        };

        return (
          <div className="attendance-row" key={i}>
            <div className="student-name">{s.studentName}</div>
            
            <div className="attendance-days">
              {s.records.map((r, idx) => (
                <div key={idx} className="box-wrapper">
                  <span 
                    className={`day-box ${r.status}`} 
                    title={`${r.date} (Slot ${r.slot}): ${r.status}`} 
                  />
                </div>
              ))}
            </div>

            <div className="attendance-summary">
               {monthlyAttended}/{monthlyTotal}<br/>
               <small>{monthlyPercentage}%</small>
            </div>

            <div className="attendance-summary total-col">
               {overallAttended}/{overallTotal}
            </div>

            <div 
              className="attendance-summary total-col"
              style={{ 
                backgroundColor: getColor(overallPercentage),
                fontWeight: 'bold'
              }}
            >
               {overallPercentage.toFixed(1)}%
            </div>
          </div>
        );
      })}
      
      {data.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No attendance data found. Select filters and click Fetch.
        </div>
      )}
    </div>
  );
}