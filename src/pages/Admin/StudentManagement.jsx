import { useState, useEffect } from "react";
import api from "../utils/api";
import * as XLSX from 'xlsx';

const StudentManagement = () => {
  // Dropdown Data
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  // Filter / Form States
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  
  // Create/Edit Form Data
  const [formData, setFormData] = useState({ roll: "", name: "", email: "" });
  const [editId, setEditId] = useState(null); // If not null, we are in edit mode
  const [loading, setLoading] = useState(false);

  // Bulk Upload States
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 1. Initial Load (Depts)
  useEffect(() => {
    api.get("/admin/depts").then(res => setDepts(res.data)).catch(console.error);
  }, []);

  // 2. Cascade Batches
  useEffect(() => {
    if (selectedDept) {
      api.get("/admin/batches").then(res => {
        setBatches(res.data.filter(b => b.dept_id === parseInt(selectedDept)));
      });
    } else setBatches([]);
  }, [selectedDept]);

  // 3. Cascade Sections
  useEffect(() => {
    if (selectedBatch) {
      api.get("/admin/sections").then(res => {
        setSections(res.data.filter(s => s.batch_id === parseInt(selectedBatch)));
      });
    } else setSections([]);
  }, [selectedBatch]);

  // 4. Fetch Students when Section is selected
  useEffect(() => {
    if (selectedSection) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedSection]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Reusing the filter endpoint which is perfect for this view
      const res = await api.get(`/admin/students-by-filter`, { 
        params: { section_id: selectedSection } 
      });
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Submit (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSection) return alert("Please select Department, Batch, and Section first.");

    try {
      if (editId) {
        // UPDATE
        await api.put(`/admin/students/${editId}`, {
            name: formData.name,
            roll: formData.roll,
            email: formData.email,
            section_id: selectedSection // Keep them in the currently selected section
        });
        alert("Student Updated");
      } else {
        // CREATE
        await api.post("/admin/students", {
            ...formData,
            section_id: selectedSection
        });
        alert("Student Added");
      }
      
      // Reset Form
      setFormData({ roll: "", name: "", email: "" });
      setEditId(null);
      fetchStudents(); // Refresh List

    } catch (e) {
      alert("Error: " + (e.response?.data?.error || e.message));
    }
  };

  // 6. Handle Edit
  const handleEdit = (student) => {
    setEditId(student.id);
    setFormData({
        roll: student.roll_number,
        name: student.full_name,
        email: student.email
    });
    setShowBulkUpload(false); // Close bulk upload if open
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 7. Handle Delete
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This will delete attendance records too.")) return;
    try {
        await api.delete(`/admin/students/${id}`);
        fetchStudents();
    } catch(e) {
        alert("Error deleting student");
    }
  };

  const handleCancel = () => {
      setEditId(null);
      setFormData({ roll: "", name: "", email: "" });
  };

  // 8. Bulk Upload Functions
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
        roll: row.roll || row.Roll || row.roll_number || row.Roll_Number || "",
        name: row.name || row.Name || row.full_name || row.Full_Name || "",
        email: row.email || row.Email || ""
      }));
      
      setBulkData(formatted);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (!selectedSection) {
      alert("Please select Department, Batch, and Section first");
      return;
    }

    if (bulkData.length === 0) {
      alert("Please upload a file first");
      return;
    }

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const student of bulkData) {
      try {
        await api.post("/admin/students", {
          roll: student.roll,
          name: student.name,
          email: student.email,
          section_id: selectedSection
        });
        successCount++;
      } catch (e) {
        errorCount++;
        errors.push(`${student.roll}: ${e.response?.data?.error || e.message}`);
      }
    }

    setUploading(false);
    alert(`Students Created: ${successCount}\nFailed: ${errorCount}${errors.length > 0 ? '\n\nErrors:\n' + errors.slice(0, 5).join('\n') + (errors.length > 5 ? '\n...' : '') : ''}`);
    
    if (successCount > 0) {
      fetchStudents();
      setShowBulkUpload(false);
      setBulkFile(null);
      setBulkData([]);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { roll_number: "AM.SC.U4CSE23001", full_name: "John Raj", email: "john@students.amrita.edu" },
      { roll_number: "AM.SC.U4CSE23003", full_name: "Ani Kumar", email: "ani@students.amrita.edu" }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_template.xlsx");
  };

  return (
    <div>
      {/* FILTER HEADER */}
      <div style={filterContainer}>
        <div style={{flex:1}}>
            <label style={labelStyle}>Department</label>
            <select style={selectStyle} onChange={e => setSelectedDept(e.target.value)} value={selectedDept}>
                <option value="">Select Dept</option>
                {depts.map(d=><option key={d.id} value={d.id}>{d.dept_code}</option>)}
            </select>
        </div>
        <div style={{flex:1}}>
            <label style={labelStyle}>Batch</label>
            <select style={selectStyle} onChange={e => setSelectedBatch(e.target.value)} value={selectedBatch} disabled={!selectedDept}>
                <option value="">Select Batch</option>
                {batches.map(b=><option key={b.id} value={b.id}>{b.batch_name}</option>)}
            </select>
        </div>
        <div style={{flex:1}}>
            <label style={labelStyle}>Section</label>
            <select style={selectStyle} onChange={e => setSelectedSection(e.target.value)} value={selectedSection} disabled={!selectedBatch}>
                <option value="">Select Section</option>
                {sections.map(s=><option key={s.id} value={s.id}>{s.section_name}</option>)}
            </select>
        </div>
      </div>

      {selectedSection ? (
        <>
            {/* ACTION BUTTONS */}
            <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginBottom:'15px'}}>
              <button style={primaryBtn} onClick={downloadTemplate}>Download Template</button>
              <button 
                style={primaryBtn} 
                onClick={() => {
                  setShowBulkUpload(!showBulkUpload);
                  setEditId(null);
                  setFormData({ roll: "", name: "", email: "" });
                }}
              >
                {showBulkUpload ? "Cancel Bulk Upload" : "+ Bulk Upload"}
              </button>
            </div>

            {/* BULK UPLOAD SECTION */}
            {showBulkUpload && (
              <div style={{...formBox, border:'2px solid #AD3A3C', marginBottom:'20px'}}>
                <h4 style={{margin:'0 0 15px', color:'#AD3A3C'}}>Bulk Upload Students</h4>
                

                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileUpload}
                  style={{marginBottom:'15px', padding:'8px', border:'1px solid #ddd', borderRadius:'4px', width:'100%'}}
                />
                
                {bulkData.length > 0 && (
                  <div style={{background:'white', padding:'15px', borderRadius:'4px', marginBottom:'15px', border:'1px solid #ddd'}}>
                    <p style={{margin:'0 0 10px', fontWeight:'bold'}}>Preview ({bulkData.length} students)</p>
                    <div style={{maxHeight:'300px', overflow:'auto'}}>
                      <table style={{...tableStyle, fontSize:'11px'}}>
                        <thead>
                          <tr>
                            <th style={thStyle}>Roll Number</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.map((row, idx) => (
                            <tr key={idx}>
                              <td style={tdStyle}>{row.roll}</td>
                              <td style={tdStyle}>{row.name}</td>
                              <td style={tdStyle}>{row.email}</td>
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
                  disabled={uploading || bulkData.length === 0}
                >
                  {uploading ? "Uploading..." : "Create Students"}
                </button>
              </div>
            )}

            {/* ADD / EDIT FORM */}
            {!showBulkUpload && (
              <div style={formBox}>
                  <h4 style={{marginTop:0, color:'#AD3A3C'}}>{editId ? "Edit Student" : "Add New Student"}</h4>
                  <form onSubmit={handleSubmit} style={{display:'flex', gap:'10px', alignItems:'flex-end'}}>
                      <div style={{flex:1}}>
                          <label style={labelStyle}>Roll Number</label>
                          <input style={inputStyle} value={formData.roll} onChange={e=>setFormData({...formData, roll:e.target.value})} required placeholder="e.g. AM.EN.U4CSE23114" />
                      </div>
                      <div style={{flex:2}}>
                          <label style={labelStyle}>Full Name</label>
                          <input style={inputStyle} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required placeholder="Student Name" />
                      </div>
                      <div style={{flex:2}}>
                          <label style={labelStyle}>Email</label>
                          <input type="email" style={inputStyle} value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required placeholder="student@students.amrita.edu" />
                      </div>
                      <button type="submit" style={editId ? updateBtn : primaryBtn}>{editId ? "Update" : "Add"}</button>
                      {editId && <button type="button" onClick={handleCancel} style={cancelBtn}>Cancel</button>}
                  </form>
              </div>
            )}

            {/* LIST */}
            <h4 style={{marginBottom:'10px'}}>Student List ({students.length})</h4>
            {loading ? <p>Loading...</p> : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Roll No</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? students.map(s => (
                            <tr key={s.id}>
                                <td style={tdStyle}>{s.roll_number}</td>
                                <td style={tdStyle}>{s.full_name}</td>
                                <td style={tdStyle}>{s.email}</td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleEdit(s)} style={actionBtn}>Edit</button>
                                    <button onClick={() => handleDelete(s.id)} style={{...actionBtn, background:'#dc3545', marginLeft:'5px'}}>Delete</button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4" style={{padding:'20px', textAlign:'center', color:'#999'}}>No students found in this section.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </>
      ) : (
        <div style={{textAlign:'center', padding:'50px', color:'#999', background:'#f9f9f9', borderRadius:'8px', marginTop:'20px'}}>
            Please select Department, Batch, and Section to manage students.
        </div>
      )}
    </div>
  );
};

/* STYLES */
const filterContainer = { display: "flex", gap: "20px", background: "#eee", padding: "15px", borderRadius: "8px", marginBottom: "20px" };
const formBox = { background: "#fdfdfd", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "25px" };
const labelStyle = { display:'block', fontSize:'12px', fontWeight:'bold', color:'#555', marginBottom:'5px'};
const inputStyle = { width:'100%', padding: "8px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px", boxSizing:'border-box' };
const selectStyle = { width:'100%', padding: "8px", borderRadius: "4px", border: "1px solid #ccc" };

const primaryBtn = { padding: "8px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", height:"35px" };
const updateBtn = { padding: "8px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", height:"35px" };
const cancelBtn = { padding: "8px 20px", background: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height:"35px", marginLeft:'5px' };
const actionBtn = { padding: "5px 10px", background: "#333", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize:"12px" };

const tableStyle = { width: "100%", borderCollapse: "collapse", background:'white' };
const thStyle = { textAlign: "left", padding: "10px", background: "#eee", borderBottom: "2px solid #ddd", color:'#333', fontSize:'13px' };
const tdStyle = { padding: "10px", borderBottom: "1px solid #eee", color:'#444', fontSize:'13px' };

export default StudentManagement;