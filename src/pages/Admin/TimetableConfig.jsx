

import { useState, useEffect } from "react";
import api from "../utils";

const TimetableConfig = () => {
  // --- CONTEXT STATE ---
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [semester, setSemester] = useState("1");

  // --- DATA STATE ---
  const [timetable, setTimetable] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    day: "Mon",
    slot: 1,
    course_code: "",
    faculty_profile_id: "", // Renamed to match backend logic clearer
    room: ""
  });

  // 1. Fetch Basics (Depts, Courses, Faculty)
  useEffect(() => {
    const loadBasics = async () => {
      try {
        const d = await api.get("/admin/depts");
        setDepts(d.data);
        const c = await api.get("/admin/courses");
        setCourses(c.data);
        
        // This endpoint returns: { profile_id, faculty_name, ... }
        const f = await api.get("/admin/faculty");
        setFaculty(f.data);
      } catch(e) { console.error(e); }
    };
    loadBasics();
  }, []);

  // 2. Cascade Dropdowns
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

  // 3. Auto-Fetch Timetable
  useEffect(() => {
    if (selectedSection && semester) {
      fetchTimetable();
    } else {
      setTimetable([]);
    }
  }, [selectedSection, semester]);

  const fetchTimetable = async () => {
    try {
      const res = await api.get(`/common/timetable-by-class?section_id=${selectedSection}&semester=${semester}`);
      setTimetable(res.data);
    } catch (e) { console.error(e); }
  };

  // 4. Handle Add Slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedSection) return alert("Select a section first!");

    const payload = {
      section_id: selectedSection,
      semester: semester,
      day: formData.day,
      slot: formData.slot,
      course_code: formData.course_code,
      faculty_id: formData.faculty_profile_id, // Backend expects 'faculty_id' which maps to profile_id
      room: formData.room
    };

    try {
      await api.post("/admin/timetable", payload);
      fetchTimetable(); // Refresh grid
      alert("Slot Added Successfully");
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Remove this slot?")) return;
    try {
      await api.delete(`/admin/timetable/${id}`);
      fetchTimetable();
    } catch(e) { alert("Error deleting slot"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      
      {/* 1. TOP BAR: Context Selection */}
      <div style={topBarStyle}>
        <span style={{fontWeight:'bold', marginRight:10, fontSize:'14px'}}>Editing For: </span>
        <select style={selectSmall} onChange={e => setSelectedDept(e.target.value)} value={selectedDept}>
          <option value="">Select Dept</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
        </select>
        <select style={selectSmall} onChange={e => setSelectedBatch(e.target.value)} value={selectedBatch}>
          <option value="">Select Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
        </select>
        <select style={selectSmall} onChange={e => setSelectedSection(e.target.value)} value={selectedSection}>
          <option value="">Select Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
        </select>
        <select style={selectSmall} onChange={e => setSemester(e.target.value)} value={semester}>
          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
        </select>
      </div>

      {/* 2. SPLIT VIEW */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flex: 1 }}>
        
        {/* LEFT: PREVIEW GRID */}
        <div style={{ flex: 3, border: "1px solid #ddd", borderRadius: "8px", padding: "15px", overflow: "auto", background:"white" }}>
          <h4 style={{ marginTop: 0, color: "#AD3A3C", borderBottom:"1px solid #eee", paddingBottom:"10px" }}>Live Preview</h4>
          {selectedSection ? (
             <InteractiveGrid data={timetable} onDelete={handleDelete} />
          ) : (
            <div style={{ textAlign: "center", marginTop: "50px", color: "#999" }}>Select Class to View Timetable</div>
          )}
        </div>

        {/* RIGHT: ADD SLOT FORM */}
        <div style={{ flex: 1, background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #ccc", height:"fit-content" }}>
          <h4 style={{ marginTop: 0 }}>Add New Slot</h4>
          <form onSubmit={handleAddSlot} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            <label style={labelStyle}>Day</label>
            <select style={inputStyle} value={formData.day} onChange={e=>setFormData({...formData, day: e.target.value})}>
              {["Mon","Tue","Wed","Thu","Fri"].map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <label style={labelStyle}>Slot Number</label>
            <select style={inputStyle} value={formData.slot} onChange={e=>setFormData({...formData, slot: e.target.value})}>
              {[1,2,3,4,5,6,7,8,9].map(s => <option key={s} value={s}>Slot {s}</option>)}
            </select>

            <label style={labelStyle}>Course</label>
            <select style={inputStyle} value={formData.course_code} onChange={e=>setFormData({...formData, course_code: e.target.value})} required>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.course_code} value={c.course_code}>{c.course_name}</option>)}
            </select>

            <label style={labelStyle}>Faculty</label>
            <select 
                style={inputStyle} 
                value={formData.faculty_profile_id} 
                onChange={e=>setFormData({...formData, faculty_profile_id: e.target.value})} 
                required
            >
              <option value="">Select Faculty</option>
              {faculty.map(f => (
                // Use f.profile_id here because that's what the timetable table links to
                <option key={f.profile_id} value={f.profile_id}>
                    {f.faculty_name}
                </option>
              ))}
            </select>

            <label style={labelStyle}>Room</label>
            <input style={inputStyle} placeholder="e.g. 101" value={formData.room} onChange={e=>setFormData({...formData, room: e.target.value})} />

            <button type="submit" style={btnPrimary}>+ Add to Grid</button>
          </form>
        </div>

      </div>
    </div>
  );
};

// --- INTERACTIVE GRID COMPONENT ---
const InteractiveGrid = ({ data, onDelete }) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
    const getSlotData = (day, slotNum) => data.find(t => t.day === day && t.slot_number === slotNum);
  
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", tableLayout:"fixed" }}>
        <thead>
          <tr>
            <th style={{...thStyle, width:"50px"}}></th>
            {slots.map(s => <th key={s} style={thStyle}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td style={{ ...tdStyle, fontWeight: "bold", background: "#f0f0f0" }}>{day}</td>
              {slots.map(slot => {
                const entry = getSlotData(day, slot);
                return (
                  <td key={slot} style={{ ...tdStyle, background: entry ? "#eef" : "#fafafa", position:'relative' }}>
                    {entry ? (
                      <div>
                        <div style={{ fontWeight: "bold", color: "#333", fontSize:"10px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={entry.course_name}>
                          {entry.course_name}
                        </div>
                        <div style={{ color: "#666", fontSize: "9px" }}>{entry.faculty_name}</div>
                        <button 
                            onClick={() => onDelete(entry.id)}
                            style={{ 
                                position: "absolute", top: "2px", right: "2px", 
                                background: "#ff4d4f", color: "white", border: "none", 
                                borderRadius: "3px", width: "14px", height: "14px", 
                                fontSize: "10px", lineHeight:"10px", cursor: "pointer", padding:0 
                            }}
                            title="Delete Slot"
                        >×</button>
                      </div>
                    ) : (
                      <span style={{ color: "#eee" }}>+</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
};

// Styles
const topBarStyle = { background: "#eee", padding: "10px", borderRadius: "5px", display: "flex", alignItems: "center", gap: "10px" };
const selectSmall = { padding: "5px", borderRadius: "4px", border: "1px solid #ccc" };
const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", boxSizing:"border-box" };
const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#555" };
const btnPrimary = { padding: "10px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" };
const thStyle = { background: "#666", color: "white", padding: "8px", fontSize: "12px", border: "1px solid #ccc" };
const tdStyle = { border: "1px solid #ddd", padding: "5px", textAlign: "center", height: "50px", verticalAlign: "middle" };

export default TimetableConfig;