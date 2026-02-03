import { useState, useEffect } from "react";
import api from "../utils/api";

const AttendanceShortage = () => {
  // --- 1. Filter States ---
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);

  // --- 2. Selection States ---
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [semester, setSemester] = useState("1");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [threshold, setThreshold] = useState(75);

  // --- 3. Data States ---
  const [shortageList, setShortageList] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 4. Initial Fetches ---
  useEffect(() => {
    const loadBasics = async () => {
        try {
            const d = await api.get("/admin/depts");
            setDepts(d.data);
        } catch (e) { console.error(e); }
    };
    loadBasics();
  }, []);

  // --- 5. Cascading Dropdowns ---
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

  // --- 6. Fetch Courses relevant to the Class & Semester ---
  useEffect(() => {
    if (selectedSection && semester) {
        api.get(`/common/timetable-by-class?section_id=${selectedSection}&semester=${semester}`)
           .then(res => {
               const uniqueCourses = [];
               const map = new Map();
               for (const item of res.data) {
                   if(!map.has(item.course_code)){
                       map.set(item.course_code, true);
                       uniqueCourses.push({
                           course_code: item.course_code,
                           course_name: item.course_name
                       });
                   }
               }
               setCourses(uniqueCourses);
               setSelectedSubject("ALL");
           })
           .catch(err => {
               console.error("Failed to load class courses", err);
               setCourses([]);
           });
    } else {
        setCourses([]);
    }
  }, [selectedSection, semester]);

  // --- 7. Main Fetch Logic (Updated to use new endpoint) ---
  const fetchShortageList = async () => {
    if (!selectedSection || !semester) return alert("Please select section and semester");
    
    setLoading(true);
    try {
      // ✅ CHANGED: Using dedicated shortage endpoint
      const res = await api.get("/admin/attendance-shortage", {
        params: {
            section_id: selectedSection,
            semester: semester,
            course_code: selectedSubject,
            threshold: threshold
        }
      });
      setShortageList(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch shortage list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* FILTERS */}
      <div style={filterContainer}>
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', flex:1}}>
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

            <select style={selectStyle} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={courses.length === 0}>
                <option value="ALL">All Subjects</option>
                {courses.map((s) => (
                    <option key={s.course_code} value={s.course_code}>{s.course_name}</option>
                ))}
            </select>

            <div style={{display:'flex', alignItems:'center', background:'white', border:'1px solid #ccc', borderRadius:'4px', padding:'0 5px'}}>
                <label style={{fontSize:'12px', fontWeight:'bold', paddingLeft:'5px'}}>Threshold % &lt; </label>
                <input 
                    type="number" 
                    value={threshold} 
                    onChange={e => setThreshold(e.target.value)} 
                    style={{...selectStyle, border:'none', width:'50px'}}
                    min="0"
                    max="100"
                />
            </div>
        </div>

        <button onClick={fetchShortageList} style={btnStyle}>Check Shortage</button>
      </div>

      {/* SHORTAGE TABLE */}
      {loading ? <p style={{textAlign:'center', marginTop:'30px'}}>Calculating attendance...</p> : (
        <>
            <table style={tableStyle}>
                <thead>
                <tr>
                    <th style={thStyle}>Roll No</th>
                    <th style={thStyle}>Student Name</th>
                    <th style={thStyle}>Subject</th>
                    <th style={thStyle}>Attended / Total</th>
                    <th style={thStyle}>Percentage</th>
                </tr>
                </thead>

                <tbody>
                {shortageList.length > 0 ? shortageList.map((s, index) => (
                    <tr key={index}>
                        <td style={tdStyle}>{s.roll_number}</td>
                        <td style={tdStyle}><strong>{s.full_name}</strong></td>
                        <td style={tdStyle}>{s.subject}</td>
                        <td style={tdStyle}>{s.attended} / {s.total}</td>
                        <td style={{...tdStyle, fontWeight:'bold', color: parseFloat(s.percentage) < 75 ? '#D8000C' : 'green'}}>
                            {s.percentage}%
                        </td>
                    </tr>
                )) : (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#999'}}>
                        No students found below {threshold}% attendance.
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
  marginTop: "10px",
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

export default AttendanceShortage;