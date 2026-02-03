
import { useState, useEffect } from "react";
import api from "../utils/api";

const AttendanceOverview = () => {
  // Dropdown Data States
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  // Selection States
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [semester, setSemester] = useState("1");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Table Data State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. Load Dropdown Data ---
  useEffect(() => {
    api.get("/admin/depts").then(res => setDepts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDept) {
      api.get("/admin/batches").then(res => {
        setBatches(res.data.filter(b => b.dept_id === parseInt(selectedDept)));
      });
    } else setBatches([]);
  }, [selectedDept]);

  useEffect(() => {
    if (selectedBatch) {
      api.get("/admin/sections").then(res => {
        setSections(res.data.filter(s => s.batch_id === parseInt(selectedBatch)));
      });
    } else setSections([]);
  }, [selectedBatch]);

  // --- 2. Fetch Data (UPDATED) ---
  const fetchOverview = async () => {
    if (!selectedSection || !semester || !selectedDate) return alert("Please select all fields");
    
    setLoading(true);
    setSessions([]);

    try {
      // Use the NEW dedicated endpoint
      const res = await api.get(`/admin/daily-attendance-overview`, {
        params: { 
            section_id: selectedSection, 
            date: selectedDate, 
            semester: semester 
        }
      });
      console.log("Fetched Sessions:", res.data);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* FILTER BAR */}
      <div style={filterContainer}>
        <select style={selectStyle} onChange={e => setSelectedDept(e.target.value)} value={selectedDept}>
          <option value="">Select Dept</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
        </select>

        <select style={selectStyle} onChange={e => setSelectedBatch(e.target.value)} value={selectedBatch} disabled={!selectedDept}>
          <option value="">Select Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
        </select>

        <select style={selectStyle} onChange={e => setSelectedSection(e.target.value)} value={selectedSection} disabled={!selectedBatch}>
          <option value="">Select Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
        </select>

        <select style={selectStyle} onChange={e => setSemester(e.target.value)} value={semester}>
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
        </select>

        <div style={{display:'flex', alignItems:'center', gap:'5px', background:'white', padding:'0 5px', borderRadius:'4px', border:'1px solid #ccc'}}>
           <label style={{fontSize:'12px', fontWeight:'bold', color:'#555', paddingLeft:'5px'}}>Date:</label>
           <input type="date" style={{...selectStyle, border:'none'}} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}/>
        </div>

        <button onClick={fetchOverview} style={btnStyle}>Fetch Data</button>
      </div>

      {/* SESSION TABLE */}
      {loading ? <p style={{textAlign:'center', marginTop:'30px'}}>Loading...</p> : (
        <>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Peroid</th>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Faculty</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Present</th>
                <th style={thStyle}>Absent</th>
                <th style={thStyle}>Percentage</th>
              </tr>
            </thead>

            <tbody>
              {sessions.length > 0 ? sessions.map((s, index) => {
                // Calculate percentage
                const percentage = s.total_count > 0 
                    ? (((s.present_count + s.late_count) / s.total_count) * 100).toFixed(1) + "%" 
                    : "-";
                
                // Determine display course name (Handle Swap)
                const displayCourse = s.session_category === 'swap' 
                    ? s.actual_course_name || s.actual_course_code 
                    : s.scheduled_course_name;

                return (
                  <tr key={index}>
                    <td style={tdStyle}>{s.slot_number}</td>
                    
                    <td style={tdStyle}>
                        <strong>{displayCourse}</strong>
                        {s.session_category === 'swap' && (
                            <div style={{fontSize:'10px', color:'#999', textDecoration:'line-through'}}>
                                Scheduled: {s.scheduled_course_name}
                            </div>
                        )}
                    </td>

                    <td style={tdStyle}>{s.faculty_name}</td>
                    
                    <td style={tdStyle}>
                        {s.session_category ? (
                            <span style={getTypeBadge(s.session_category)}>
                                {s.session_category.toUpperCase()}
                            </span>
                        ) : (
                            <span style={{color:'#999', fontSize:'11px'}}>Unmarked</span>
                        )}
                    </td>

                    <td style={{...tdStyle, color:'green', fontWeight:'bold'}}>
                        {s.present_count !== null ? s.present_count+s.late_count : "-"}
                    </td>
                    <td style={{...tdStyle, color:'red', fontWeight:'bold'}}>
                        {s.absent_count !== null ? s.absent_count : "-"}
                    </td>
                    <td style={tdStyle}>{percentage}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'30px', color:'#999'}}>
                    No classes scheduled for this day (or data unavailable).
                </td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const filterContainer = {
    display: "flex", gap: "10px", background: "#f5f5f5", padding: "15px", borderRadius: "8px", alignItems: "center", marginBottom: "20px", flexWrap:'wrap', border:"1px solid #ddd"
};

const selectStyle = {
    padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "100px", fontSize:'13px'
};

const btnStyle = {
    padding: "8px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginLeft: "auto"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const thStyle = {
    background: "#eee", color: "#333", padding: "12px", borderBottom: "2px solid #ddd", textAlign: "left", fontSize:'13px'
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  color: "#555",
  fontSize: "13px"
};

const getTypeBadge = (type) => {
    let bg = "#eee"; let col = "#333";
    if(type === 'normal') { bg = "#d4edda"; col = "#155724"; }
    if(type === 'swap') { bg = "#fff3cd"; col = "#856404"; }
    if(type === 'free') { bg = "#e2e3f5"; col = "#383d41"; }
    
    return {
        backgroundColor: bg,
        color: col,
        padding: "3px 8px",
        borderRadius: "10px",
        fontSize: "11px",
        fontWeight: "bold"
    };
};

export default AttendanceOverview;