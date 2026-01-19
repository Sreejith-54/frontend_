import { useState, useEffect } from "react";
import api from "../utils/api";
import * as XLSX from 'xlsx';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("directory");

  return (
    <div>
      {/* 3-WAY TAB SWITCH */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", borderBottom: "1px solid #ddd", paddingBottom:"10px" }}>
        <button style={tabBtn(activeTab === "directory")} onClick={() => setActiveTab("directory")}>
          1. Faculty Directory (Profiles)
        </button>
        <button style={tabBtn(activeTab === "logins")} onClick={() => setActiveTab("logins")}>
          2. Faculty User Creation
        </button>
        <button style={tabBtn(activeTab === "students")} onClick={() => setActiveTab("students")}>
          3. Student & CR Management
        </button>
      </div>

      {/* CONTENT RENDER */}
      <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
        {activeTab === "directory" && <FacultyDirectory />}
        {activeTab === "logins" && <FacultyUserCreation />}
        {activeTab === "students" && <StudentCRSection />}
      </div>
    </div>
  );
};

/* =========================================================================================
   TAB 1: FACULTY DIRECTORY
   ========================================================================================= */
const FacultyDirectory = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [depts, setDepts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", dept: "", auth_key: "" });
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => { 
    try { 
      const [facRes, deptRes] = await Promise.all([
          api.get("/admin/faculty"),
          api.get("/admin/depts")
      ]);
      setFacultyList(facRes.data); 
      setDepts(deptRes.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
        await api.post("/admin/faculty-profile", profileForm);
        alert("Faculty Profile Added!");
        setShowForm(false);
        setProfileForm({ name: "", email: "", dept_id: "", auth_key: "" });
        fetchData();
    } catch (e) { alert("Error: " + (e.response?.data?.error || e.message)); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBulkFile(file);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      const formatted = jsonData.map(row => ({
        name: row.name || row.Name || "",
        email: row.email || row.Email || "",
        dept: row.dept || row.Dept || "",
        auth_key: row.auth_key || row.Auth_Key || row.auth_key || ""
      }));
      
      setBulkData(formatted);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (bulkData.length === 0) {
      alert("Please upload a file first");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const faculty of bulkData) {
      try {
        
        const deptMatch = depts.find(d => 
          d.dept_code?.toUpperCase() === faculty.dept?.toUpperCase() ||
          d.dept_name?.toUpperCase() === faculty.dept?.toUpperCase()
        );

        if (!deptMatch) {
          errorCount++;
          errors.push(`${faculty.email}: Department '${faculty.dept}' not found`);
          continue;
        }

        await api.post("/admin/faculty-profile", {
          name: faculty.name,
          email: faculty.email,
          dept_id: deptMatch.id,
          auth_key: faculty.auth_key
        });
        successCount++;
      } catch (e) {
        errorCount++;
        errors.push(`${faculty.email}: ${e.response?.data?.error || e.message}`);
      }
    }

    setUploading(false);
    alert(`Profiles Created: ${successCount}\nFailed: ${errorCount}${errors.length > 0 ? '\n\nErrors:\n' + errors.slice(0, 5).join('\n') + (errors.length > 5 ? '\n...' : '') : ''}\n\n`);
    
    if (successCount > 0) {
      fetchData();
      setShowBulkUpload(false);
      setBulkFile(null);
      setBulkData([]);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { name: "Dr John Doe", email: "john@example.com", dept: "CSE", auth_key: "ABC123" },
      { name: "Dr Jane Smith", email: "jane@example.com", dept: "ECE", auth_key: "XYZ456" },
      { name: "Dr Robert Brown", email: "robert@example.com", dept: "MECH", auth_key: "DEF789" }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Profiles");
    XLSX.writeFile(wb, "faculty_profiles_template.xlsx");
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom:'20px' }}>
        <div>
          <h3 style={{margin:0}}>Faculty Directory</h3>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button style={primaryBtn} onClick={downloadTemplate}>Download Template</button>
          <button style={primaryBtn} onClick={() => {setShowBulkUpload(!showBulkUpload); setShowForm(false)}}>{showBulkUpload ? "Cancel" : "+ Upload Profiles"}</button>
          <button style={primaryBtn} onClick={() => {setShowForm(!showForm); setShowBulkUpload(false)}}>{showForm ? "Cancel" : "+ Add Profile"}</button>
        </div>
      </div>

      {showBulkUpload && (
        <div style={{...formContainer, border:'2px solid #AD3A3C'}}>
          <h4 style={{margin:'0 0 15px'}}>Upload Faculty Profiles</h4>
          

          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileUpload}
            style={{marginBottom:'15px', padding:'8px', border:'1px solid #ddd', borderRadius:'4px', width:'100%'}}
          />
          
          {bulkData.length > 0 && (
            <div style={{background:'white', padding:'15px', borderRadius:'4px', marginBottom:'15px', border:'1px solid #ddd'}}>
              <p style={{margin:'0 0 10px', fontWeight:'bold'}}>Preview ({bulkData.length} profiles)</p>
              <div style={{maxHeight:'200px', overflow:'auto'}}>
                <table style={{...tableStyle, fontSize:'11px'}}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Dept</th>
                      <th style={thStyle}>Auth Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map((row, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{row.name}</td>
                        <td style={tdStyle}>{row.email}</td>
                        <td style={tdStyle}>{row.dept}</td>
                        <td style={tdStyle}>{row.auth_key}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleBulkUpload} 
            style={primaryBtn}
            disabled={uploading}
          >
            {uploading ? "Creating Profiles..." : "Create Profiles"}
          </button>
        </div>
      )}

      {showForm && (
        <div style={formContainer}>
          <form onSubmit={handleCreateProfile} style={{ display: "flex", gap: "15px", alignItems: "flex-end", flexWrap:"wrap" }}>
            <div style={{flex:1}}><label style={labelStyle}>Name</label><input style={inputStyle} value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name:e.target.value})} required /></div>
            <div style={{flex:1}}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={profileForm.email} onChange={e=>setProfileForm({...profileForm, email:e.target.value})} required /></div>
            <div style={{width:'150px'}}><label style={labelStyle}>Dept</label><select style={inputStyle} value={profileForm.dept_id} onChange={e=>setProfileForm({...profileForm, dept_id:e.target.value})} required><option value="">Select</option>{depts.map(d=><option key={d.id} value={d.id}>{d.dept_code}</option>)}</select></div>
            <div style={{width:'150px'}}><label style={labelStyle}>Auth Key</label><input style={inputStyle} maxLength="6" value={profileForm.auth_key} onChange={e=>setProfileForm({...profileForm, auth_key:e.target.value})} required /></div>
            <button type="submit" style={primaryBtn}>Save</button>
          </form>
        </div>
      )}

      <table style={tableStyle}>
        <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Dept</th><th style={thStyle}>Auth Key</th></tr></thead>
        <tbody>{facultyList.map(f=>(<tr key={f.profile_id}><td style={tdStyle}><strong>{f.faculty_name}</strong></td><td style={tdStyle}>{f.email}</td><td style={tdStyle}>{f.dept_code}</td><td style={tdStyle}>{f.authorization_key}</td></tr>))}</tbody>
      </table>
    </>
  );
};

/* =========================================================================================
   TAB 2: FACULTY USER CREATION
   ========================================================================================= */
const FacultyUserCreation = () => {
    const [pendingList, setPendingList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [password, setPassword] = useState("");
  
    useEffect(() => { fetchPending(); }, []);
  
    const fetchPending = async () => { 
      try { 
        const res = await api.get("/admin/faculty");
        setPendingList(res.data.filter(f => !f.user_id)); 
      } catch (e) { console.error(e); }
    };
  
    const handleCreateLogin = async (e) => {
        e.preventDefault();
        try {
            await api.post("/admin/faculty-login", { faculty_profile_id: selectedFaculty.profile_id, password });
            alert("Login Created!"); setSelectedFaculty(null); setPassword(""); fetchPending();
        } catch (e) { alert("Error: " + (e.response?.data?.error || e.message)); }
    };
  
    return (
      <div style={{display:'flex', gap:'20px'}}>
        <div style={{flex:1}}>
            <h3>Pending Activation</h3>
            <table style={tableStyle}>
                <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Action</th></tr></thead>
                <tbody>{pendingList.map(f=>(<tr key={f.profile_id} style={{background: selectedFaculty?.profile_id===f.profile_id?'#fff3cd':'transparent'}}><td style={tdStyle}>{f.faculty_name}</td><td style={tdStyle}>{f.email}</td><td style={tdStyle}><button onClick={()=>setSelectedFaculty(f)} style={actionBtn}>Select</button></td></tr>))}</tbody>
            </table>
        </div>
        <div style={{width:'300px', background:'#f9f9f9', padding:'20px', borderRadius:'8px', border:'1px solid #eee', height:'fit-content'}}>
            <h4>Set Credentials</h4>
            {selectedFaculty ? <form onSubmit={handleCreateLogin}><p>For: <strong>{selectedFaculty.faculty_name}</strong></p><input type="password" style={inputStyle} value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Password..." /><button type="submit" style={{...primaryBtn, width:'100%', marginTop:'10px'}}>Activate</button></form> : <p style={{color:'#999'}}>Select a faculty...</p>}
        </div>
      </div>
    );
};

/* =========================================================================================
   TAB 3: STUDENT & CR MANAGEMENT
   ========================================================================================= */
const StudentCRSection = () => {
    const [depts, setDepts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
  
    // Filters
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [semester, setSemester] = useState("1");
    const [loading, setLoading] = useState(false);
  
    // Load Initial Data
    useEffect(() => { api.get("/admin/depts").then(res => setDepts(res.data)); }, []);
    
    // Cascade Batches
    useEffect(() => { 
        if (selectedDept) api.get("/admin/batches").then(res => setBatches(res.data.filter(b => b.dept_id === parseInt(selectedDept)))); 
        else setBatches([]); 
    }, [selectedDept]);
    
    // Cascade Sections
    useEffect(() => { 
        if (selectedBatch) api.get("/admin/sections").then(res => setSections(res.data.filter(s => s.batch_id === parseInt(selectedBatch)))); 
        else setSections([]); 
    }, [selectedBatch]);
  
    // --- UPDATED FETCH FUNCTION ---
    const fetchStudents = async () => {
      if (!selectedSection) return alert("Select a section");
      setLoading(true);
      try {
        // NOW SENDING SEMESTER PARAMETER
        const res = await api.get(`/admin/students-by-filter`, { 
          params: { 
              section_id: selectedSection, 
              semester: semester 
          } 
        });
        setStudents(res.data);
      } catch (e) { 
          console.error(e);
          alert("Error fetching students (Ensure timetable exists for this Sem)"); 
      } finally { 
          setLoading(false); 
      }
    };
  
    const handlePromote = async (studentId) => {
      const pwd = prompt(`Enter password for CR login (Sem ${semester}):`);
      if (!pwd) return;
      try {
        await api.post("/admin/promote-cr", { student_id: studentId, password: pwd, semester: semester });
        alert("Promoted Successfully!");
        fetchStudents();
      } catch (e) { alert(e.message); }
    };
  
    const handleDemote = async (studentId) => {
        if(!window.confirm("Remove CR privileges?")) return;
        try {
            await api.delete(`/admin/demote-cr/${studentId}`);
            alert("Demoted!");
            fetchStudents();
        } catch (e) { alert(e.message); }
    };
  
    return (
      <>
        <h3>Student List & CRs</h3>
        <p style={{fontSize:'12px', color:'#666', fontStyle:'italic'}}>
          * Students are shown only if a Timetable exists for the selected Semester.
        </p>
        
        <div style={filterContainer}>
          <select style={selectStyle} onChange={e => setSelectedDept(e.target.value)} value={selectedDept}><option value="">Dept</option>{depts.map(d=><option key={d.id} value={d.id}>{d.dept_code}</option>)}</select>
          <select style={selectStyle} onChange={e => setSelectedBatch(e.target.value)} value={selectedBatch} disabled={!selectedDept}><option value="">Batch</option>{batches.map(b=><option key={b.id} value={b.id}>{b.batch_name}</option>)}</select>
          <select style={selectStyle} onChange={e => setSelectedSection(e.target.value)} value={selectedSection} disabled={!selectedBatch}><option value="">Section</option>{sections.map(s=><option key={s.id} value={s.id}>{s.section_name}</option>)}</select>
          
          {/* SEMESTER SELECTOR */}
          <select style={{...selectStyle, border:'1px solid #AD3A3C', fontWeight:'bold', color:'#AD3A3C'}} onChange={e => setSemester(e.target.value)} value={semester}>
              {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Sem {n}</option>)}
          </select>
          
          <button onClick={fetchStudents} style={btnStyle}>Fetch</button>
        </div>
        
        {loading ? <p>Loading...</p> : (
          <table style={tableStyle}>
              <thead><tr><th style={thStyle}>Roll</th><th style={thStyle}>Name</th><th style={thStyle}>Status</th><th style={thStyle}>Action</th></tr></thead>
              <tbody>
                  {students.length > 0 ? students.map(s => (
                      <tr key={s.id}>
                          <td style={tdStyle}>{s.roll_number}</td>
                          <td style={tdStyle}>{s.full_name}</td>
                          <td style={tdStyle}>
                              {s.role === 'cr' ? (
                                  <span style={{color:'green', fontWeight:'bold', background:'#e6fffa', padding:'2px 6px', borderRadius:'4px', fontSize:'12px'}}>
                                      CR {s.cr_semester ? `(Sem ${s.cr_semester})` : ''}
                                  </span>
                              ) : <span style={{color:'#999', fontSize:'12px'}}>Student</span>}
                          </td>
                          <td style={tdStyle}>
                              {s.role !== 'cr' ? (
                                  <button onClick={()=>handlePromote(s.id)} style={actionBtn}>Promote</button>
                              ) : (
                                  <button onClick={()=>handleDemote(s.id)} style={{...actionBtn, background:'#dc3545'}}>Remove</button>
                              )}
                          </td>
                      </tr>
                  )) : (
                      <tr><td colSpan="4" style={{...tdStyle, textAlign:'center', color:'#999', padding:'20px'}}>
                          No students found.<br/>
                          <small>(Check if Timetable slots exist for Sem {semester})</small>
                      </td></tr>
                  )}
              </tbody>
          </table>
        )}
      </>
    );
};

/* ================= STYLES ================= */
const tabBtn = (active) => ({ padding: "10px 15px", border: "none", borderBottom: active ? "3px solid #AD3A3C" : "3px solid transparent", background: "none", cursor: "pointer", fontWeight: active ? "bold" : "normal", color: active ? "#AD3A3C" : "#666", fontSize: "14px", transition: "all 0.2s" });
const formContainer = { backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #eee" };
const labelStyle = { display:'block', fontSize:'12px', fontWeight:'bold', color:'#555', marginBottom:'5px'};
const inputStyle = { width:'100%', padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", boxSizing:'border-box' };
const primaryBtn = { padding: "8px 15px", backgroundColor: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize:"13px" };
const actionBtn = { padding: "5px 10px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize:"11px" };
const filterContainer = { display: "flex", gap: "10px", background: "#f5f5f5", padding: "15px", borderRadius: "8px", alignItems: "center", marginBottom:'20px', flexWrap:'wrap' };
const selectStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc", flex: 1, minWidth:'100px' };
const btnStyle = { padding: "8px 20px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "15px", backgroundColor:'white' };
const thStyle = { textAlign: "left", padding: "10px", background: "#eee", borderBottom: "2px solid #ddd", color:'#333', fontSize:'13px' };
const tdStyle = { padding: "10px", borderBottom: "1px solid #eee", color:'#444', fontSize:'13px' };

export default UserManagement;