import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

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
    faculty_profile_id: "",
    room: ""
  });

  // --- SEARCHABLE DROPDOWN STATES ---
  // Top bar
  const [deptSearch, setDeptSearch] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const deptRef = useRef(null);

  const [batchSearch, setBatchSearch] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const batchRef = useRef(null);

  const [sectionSearch, setSectionSearch] = useState("");
  const [sectionOpen, setSectionOpen] = useState(false);
  const sectionRef = useRef(null);

  const [semesterSearch, setSemesterSearch] = useState("");
  const [semesterOpen, setSemesterOpen] = useState(false);
  const semesterRef = useRef(null);

  // Form dropdowns
  const [daySearch, setDaySearch] = useState("");
  const [dayOpen, setDayOpen] = useState(false);
  const dayRef = useRef(null);

  const [slotSearch, setSlotSearch] = useState("");
  const [slotOpen, setSlotOpen] = useState(false);
  const slotRef = useRef(null);

  const [courseSearch, setCourseSearch] = useState("");
  const [courseOpen, setCourseOpen] = useState(false);
  const courseRef = useRef(null);

  const [facultySearch, setFacultySearch] = useState("");
  const [facultyOpen, setFacultyOpen] = useState(false);
  const facultyRef = useRef(null);

  // --- CLICK OUTSIDE EFFECT ---
  useEffect(() => {
    const close = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
      if (batchRef.current && !batchRef.current.contains(e.target)) setBatchOpen(false);
      if (sectionRef.current && !sectionRef.current.contains(e.target)) setSectionOpen(false);
      if (semesterRef.current && !semesterRef.current.contains(e.target)) setSemesterOpen(false);
      if (dayRef.current && !dayRef.current.contains(e.target)) setDayOpen(false);
      if (slotRef.current && !slotRef.current.contains(e.target)) setSlotOpen(false);
      if (courseRef.current && !courseRef.current.contains(e.target)) setCourseOpen(false);
      if (facultyRef.current && !facultyRef.current.contains(e.target)) setFacultyOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // 1. Fetch Basics (Depts, Courses, Faculty)
  useEffect(() => {
    const loadBasics = async () => {
      try {
        const d = await api.get("/api/admin/depts");
        setDepts(d.data);
        const c = await api.get("/api/admin/courses");
        setCourses(c.data);
        const f = await api.get("/api/admin/faculty");
        setFaculty(f.data);
      } catch (e) { console.error(e); }
    };
    loadBasics();
  }, []);

  // 2. Cascade Dropdowns
  useEffect(() => {
    if (selectedDept) {
      api.get("/api/admin/batches").then(res => {
        setBatches(res.data.filter(b => b.dept_id === parseInt(selectedDept)));
      });
    } else setBatches([]);
  }, [selectedDept]);

  useEffect(() => {
    if (selectedBatch) {
      api.get("/api/admin/sections").then(res => {
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
      const res = await api.get(`/api/common/timetable-by-class?section_id=${selectedSection}&semester=${semester}`);
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
      faculty_id: formData.faculty_profile_id,
      room: formData.room
    };

    try {
      await api.post("/api/admin/timetable", payload);
      fetchTimetable();
      alert("Slot Added Successfully");
    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this slot?")) return;
    try {
      await api.post(`/api/admin/delete/timetable/${id}`);
      fetchTimetable();
    } catch (e) { alert("Error deleting slot"); }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* 1. TOP BAR: Context Selection */}
      <div style={topBarStyle}>
        <span style={{ fontWeight: 'bold', marginRight: 10, fontSize: '14px' }}>Editing For: </span>

        {/* Dept */}
        <div style={{ position: "relative" }} ref={deptRef}>
          <input
            type="text"
            value={deptSearch}
            onChange={(e) => { setDeptSearch(e.target.value); setDeptOpen(true); }}
            onFocus={() => setDeptOpen(true)}
            placeholder={depts.find(d => d.id == selectedDept)?.dept_code || "Select Dept"}
            style={selectSmall}
          />
          {deptOpen && (
            <ul style={dropdownListStyle}>
              {depts.filter(d => d.dept_code.toLowerCase().includes(deptSearch.toLowerCase())).map(d => (
                <li key={d.id} style={dropdownItemStyle} onClick={() => { setSelectedDept(d.id); setDeptSearch(""); setDeptOpen(false); setSelectedBatch(""); setSelectedSection(""); }}>
                  {d.dept_code}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Batch */}
        <div style={{ position: "relative" }} ref={batchRef}>
          <input
            type="text"
            value={batchSearch}
            onChange={(e) => { setBatchSearch(e.target.value); setBatchOpen(true); }}
            onFocus={() => setBatchOpen(true)}
            placeholder={batches.find(b => b.id == selectedBatch)?.batch_name || "Select Batch"}
            style={selectSmall}
          />
          {batchOpen && (
            <ul style={dropdownListStyle}>
              {batches.filter(b => b.batch_name.toLowerCase().includes(batchSearch.toLowerCase())).map(b => (
                <li key={b.id} style={dropdownItemStyle} onClick={() => { setSelectedBatch(b.id); setBatchSearch(""); setBatchOpen(false); setSelectedSection(""); }}>
                  {b.batch_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Section */}
        <div style={{ position: "relative" }} ref={sectionRef}>
          <input
            type="text"
            value={sectionSearch}
            onChange={(e) => { setSectionSearch(e.target.value); setSectionOpen(true); }}
            onFocus={() => setSectionOpen(true)}
            placeholder={sections.find(s => s.id == selectedSection)?.section_name || "Select Section"}
            style={selectSmall}
          />
          {sectionOpen && (
            <ul style={dropdownListStyle}>
              {sections.filter(s => s.section_name.toLowerCase().includes(sectionSearch.toLowerCase())).map(s => (
                <li key={s.id} style={dropdownItemStyle} onClick={() => { setSelectedSection(s.id); setSectionSearch(""); setSectionOpen(false); }}>
                  {s.section_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Semester */}
        <div style={{ position: "relative" }} ref={semesterRef}>
          <input
            type="text"
            value={semesterSearch}
            onChange={(e) => { setSemesterSearch(e.target.value); setSemesterOpen(true); }}
            onFocus={() => setSemesterOpen(true)}
            placeholder={`Sem ${semester}`}
            style={selectSmall}
          />
          {semesterOpen && (
            <ul style={dropdownListStyle}>
              {semesters.filter(n => `Sem ${n}`.toLowerCase().includes(semesterSearch.toLowerCase())).map(n => (
                <li key={n} style={dropdownItemStyle} onClick={() => { setSemester(n); setSemesterSearch(""); setSemesterOpen(false); }}>
                  Sem {n}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 2. SPLIT VIEW */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flex: 1 }}>

        {/* LEFT: PREVIEW GRID */}
        <div style={{ flex: 3, border: "1px solid #ddd", borderRadius: "8px", padding: "15px", overflow: "auto", background: "white" }}>
          <h4 style={{ marginTop: 0, color: "#AD3A3C", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Live Preview</h4>
          {selectedSection ? (
            <InteractiveGrid data={timetable} onDelete={handleDelete} />
          ) : (
            <div style={{ textAlign: "center", marginTop: "50px", color: "#999" }}>Select Class to View Timetable</div>
          )}
        </div>

        {/* RIGHT: ADD SLOT FORM */}
        <div style={{ flex: 1, background: "#f9f9f9", padding: "20px", borderRadius: "8px", border: "1px solid #ccc", height: "fit-content" }}>
          <h4 style={{ marginTop: 0 }}>Add New Slot</h4>
          <form onSubmit={handleAddSlot} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Day */}
            <label style={labelStyle}>Day</label>
            <div style={{ position: "relative" }} ref={dayRef}>
              <input
                type="text"
                value={daySearch}
                onChange={(e) => { setDaySearch(e.target.value); setDayOpen(true); }}
                onFocus={() => setDayOpen(true)}
                placeholder={formData.day}
                style={inputStyle}
              />
              {dayOpen && (
                <ul style={dropdownListStyle}>
                  {days.filter(d => d.toLowerCase().includes(daySearch.toLowerCase())).map(d => (
                    <li key={d} style={dropdownItemStyle} onClick={() => { setFormData({ ...formData, day: d }); setDaySearch(""); setDayOpen(false); }}>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Slot Number */}
            <label style={labelStyle}>Slot Number</label>
            <div style={{ position: "relative" }} ref={slotRef}>
              <input
                type="text"
                value={slotSearch}
                onChange={(e) => { setSlotSearch(e.target.value); setSlotOpen(true); }}
                onFocus={() => setSlotOpen(true)}
                placeholder={`Slot ${formData.slot}`}
                style={inputStyle}
              />
              {slotOpen && (
                <ul style={dropdownListStyle}>
                  {slots.filter(s => `Slot ${s}`.toLowerCase().includes(slotSearch.toLowerCase())).map(s => (
                    <li key={s} style={dropdownItemStyle} onClick={() => { setFormData({ ...formData, slot: s }); setSlotSearch(""); setSlotOpen(false); }}>
                      Slot {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Course */}
            <label style={labelStyle}>Course</label>
            <div style={{ position: "relative" }} ref={courseRef}>
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => { setCourseSearch(e.target.value); setCourseOpen(true); }}
                onFocus={() => setCourseOpen(true)}
                placeholder={
                  courses.find(c => c.course_code == formData.course_code)
                    ? `${courses.find(c => c.course_code == formData.course_code).course_code} (${courses.find(c => c.course_code == formData.course_code).course_name})`
                    : "Select Course"
                }
                style={inputStyle}
              />
              {courseOpen && (
                <ul style={dropdownListStyle}>
                  {courses.filter(a => a.dept_id == selectedDept).filter(c =>
                    c.course_name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                    c.course_code.toLowerCase().includes(courseSearch.toLowerCase())
                  ).map(c => (
                    <li key={c.course_code} style={dropdownItemStyle} onClick={() => { setFormData({ ...formData, course_code: c.course_code }); setCourseSearch(""); setCourseOpen(false); }}>
                      {c.course_code} ({c.course_name})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Faculty */}
            <label style={labelStyle}>Faculty</label>
            <div style={{ position: "relative" }} ref={facultyRef}>
              <input
                type="text"
                value={facultySearch}
                onChange={(e) => { setFacultySearch(e.target.value); setFacultyOpen(true); }}
                onFocus={() => setFacultyOpen(true)}
                placeholder={faculty.find(f => f.profile_id == formData.faculty_profile_id)?.faculty_name || "Select Faculty"}
                style={inputStyle}
              />
              {facultyOpen && (
                <ul style={dropdownListStyle}>
                  {faculty.filter(f => f.faculty_name.toLowerCase().includes(facultySearch.toLowerCase())).map(f => (
                    <li key={f.profile_id} style={dropdownItemStyle} onClick={() => { setFormData({ ...formData, faculty_profile_id: f.profile_id }); setFacultySearch(""); setFacultyOpen(false); }}>
                      {f.faculty_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label style={labelStyle}>Room</label>
            <input style={inputStyle} placeholder="e.g. 101" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} />

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
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", tableLayout: "fixed" }}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: "50px" }}></th>
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
                <td key={slot} style={{ ...tdStyle, background: entry ? "#eef" : "#fafafa", position: 'relative' }}>
                  {entry ? (
                    <div>
                      <div style={{ fontWeight: "bold", color: "#333", fontSize: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={entry.course_name}>
                        {entry.course_name}
                      </div>
                      <div style={{ color: "#666", fontSize: "9px" }}>{entry.faculty_name}</div>
                      <button
                        onClick={() => onDelete(entry.id)}
                        style={{
                          position: "absolute", top: "2px", right: "2px",
                          background: "#ff4d4f", color: "white", border: "none",
                          borderRadius: "3px", width: "14px", height: "14px",
                          fontSize: "10px", lineHeight: "10px", cursor: "pointer", padding: 0
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
const inputStyle = { width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", boxSizing: "border-box" };
const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#555" };
const btnPrimary = { padding: "10px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px", fontWeight: "bold" };
const thStyle = { background: "#666", color: "white", padding: "8px", fontSize: "12px", border: "1px solid #ccc" };
const tdStyle = { border: "1px solid #ddd", padding: "5px", textAlign: "center", height: "50px", verticalAlign: "middle" };
const dropdownListStyle = { position: "absolute", width: "100%", background: "white", border: "1px solid #ccc", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, margin: "4px 0 0", borderRadius: "4px" };
const dropdownItemStyle = { padding: "8px 12px", cursor: "pointer" };

export default TimetableConfig;