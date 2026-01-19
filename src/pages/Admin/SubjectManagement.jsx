
import { useState, useEffect } from "react";
import api from "../utils/api";

const SubjectManagement = () => {
  // Data States
  const [courses, setCourses] = useState([]);
  const [depts, setDepts] = useState([]);
  
  // UI States
  const [filterDept, setFilterDept] = useState(""); // For filtering the table
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: "",
    dept_id: ""
  });

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, courseRes] = await Promise.all([
        api.get("/admin/depts"),
        api.get("/admin/courses")
      ]);
      setDepts(deptRes.data);
      setCourses(courseRes.data);
    } catch (e) {
      console.error(e);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Create Course
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/courses", formData);
      alert("Course Added Successfully!");
      setFormData({ code: "", name: "", credits: "", dept_id: "" }); // Reset form
      fetchData(); // Refresh list
    } catch (e) {
      alert("Error adding course: " + (e.response?.data?.error || e.message));
    }
  };

  // 3. Handle Delete
  const handleDelete = async (code) => {
    if (!window.confirm(`Are you sure you want to delete course ${code}?`)) return;
    try {
      await api.delete(`/admin/courses/${code}`);
      fetchData();
    } catch (e) {
      alert("Error deleting course");
    }
  };

  // Helper to get Dept Code for display
  const getDeptCode = (id) => depts.find(d => d.id === id)?.dept_code || "-";

  // Filter Logic
  const filteredCourses = filterDept 
    ? courses.filter(c => c.dept_id === parseInt(filterDept)) 
    : courses;

  return (
    <div>
      {/* 1. ADD COURSE FORM */}
      <div style={formContainer}>
        <h3 style={{ marginTop: 0, color: "#AD3A3C" }}>Add New Course</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={labelStyle}>Course Code (Unique)</label>
            <input 
                style={inputStyle} 
                placeholder="e.g. CSE101" 
                value={formData.code} 
                onChange={e => setFormData({ ...formData, code: e.target.value })} 
                required 
            />
          </div>

          <div style={{ flex: 2, minWidth: "200px" }}>
            <label style={labelStyle}>Course Name</label>
            <input 
                style={inputStyle} 
                placeholder="e.g. Data Structures" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                required 
            />
          </div>

          <div style={{ flex: 1, minWidth: "100px" }}>
            <label style={labelStyle}>Credits</label>
            <input 
                type="number" 
                style={inputStyle} 
                placeholder="e.g. 3" 
                value={formData.credits} 
                onChange={e => setFormData({ ...formData, credits: e.target.value })} 
                required 
            />
          </div>

          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={labelStyle}>Department</label>
            <select 
                style={inputStyle} 
                value={formData.dept_id} 
                onChange={e => setFormData({ ...formData, dept_id: e.target.value })} 
                required
            >
              <option value="">Select Dept</option>
              {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
            </select>
          </div>

          <button type="submit" style={primaryBtn}>+ Add Course</button>
        </form>
      </div>

      {/* 2. FILTER & LIST */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3>Existing Courses</h3>
        
        {/* Filter Dropdown */}
        <select 
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
        >
            <option value="">All Departments</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
        </select>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Code</th>
            <th style={thStyle}>Course Name</th>
            <th style={thStyle}>Credits</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((c) => (
              <tr key={c.course_code}>
                <td style={{ ...tdStyle, fontWeight: "bold" }}>{c.course_code}</td>
                <td style={tdStyle}>{c.course_name}</td>
                <td style={tdStyle}>{c.credits}</td>
                <td style={tdStyle}>{getDeptCode(c.dept_id)}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(c.course_code)} style={actionBtn}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#888" }}>No courses found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ================= STYLES ================= */

const formContainer = {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
    border: "1px solid #eee"
};

const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555"
};

const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box"
};

const primaryBtn = {
  padding: "9px 20px",
  backgroundColor: "#AD3A3C",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  height: "35px"
};

const actionBtn = {
  padding: "5px 10px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#ff4d4f",
  color: "white",
  cursor: "pointer",
  fontSize: "12px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
  backgroundColor: "white"
};

const thStyle = {
  textAlign: "left",
  padding: "12px",
  backgroundColor: "#eee",
  borderBottom: "2px solid #ddd",
  color: "#333"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  color: "#555"
};

export default SubjectManagement;