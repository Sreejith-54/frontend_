

import { useState, useEffect } from "react";
import api from "../utils/api";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({ batch_id: "", section_name: "" });
  const [editId, setEditId] = useState(null);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const [secRes, batchRes] = await Promise.all([
        api.get("/admin/sections"),
        api.get("/admin/batches")
      ]);
      setSections(secRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // --- UPDATE MODE ---
        await api.put(`/admin/sections/${editId}`, {
            section_name: formData.section_name
            // Backend API only accepts section_name for updates
        });
        alert("Section Updated!");
      } else {
        // --- CREATE MODE ---
        await api.post("/admin/sections", formData);
        alert("Section Added!");
      }
      
      // Reset Form
      handleCancel();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  // 3. Handle Edit Click
  const handleEdit = (section) => {
    setEditId(section.id);
    setFormData({
        batch_id: section.batch_id,
        section_name: section.section_name
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Handle Cancel
  const handleCancel = () => {
    setEditId(null);
    setFormData({ batch_id: "", section_name: "" });
  };

  // 5. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This might fail if students or timetables are linked to this section.")) return;
    
    try {
      await api.delete(`/admin/sections/${id}`);
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Error deleting section: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div>
      <h3>{editId ? "Edit Section" : "Add New Section"}</h3>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={{flex: 1}}>
            <label style={labelStyle}>Batch</label>
            <select
            style={{...inputStyle, background: editId ? "#eee" : "white"}}
            value={formData.batch_id}
            onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })}
            required
            disabled={!!editId} // Disabled during edit because backend doesn't support moving batches in PUT
            >
            <option value="">Select Batch</option>
            {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.batch_name} ({b.dept_code})</option>
            ))}
            </select>
        </div>

        <div style={{flex: 1}}>
            <label style={labelStyle}>Section Name</label>
            <input
            style={inputStyle}
            placeholder="e.g. A, B, C"
            value={formData.section_name}
            onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
            required
            />
        </div>

        <div style={{display:'flex', gap:'5px', alignItems:'flex-end'}}>
            <button type="submit" style={editId ? updateBtn : primaryBtn}>
                {editId ? "Update" : "Add"}
            </button>
            {editId && (
                <button type="button" onClick={handleCancel} style={cancelBtn}>
                    Cancel
                </button>
            )}
        </div>
      </form>

      <h3>Existing Sections</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Section</th>
            <th style={thStyle}>Batch</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <tr key={s.id}>
              <td style={tdStyle}><strong>{s.section_name}</strong></td>
              <td style={tdStyle}>{s.batch_name}</td>
              <td style={tdStyle}>
                <button onClick={() => handleEdit(s)} style={editActionBtn}>Edit</button>
                <button onClick={() => handleDelete(s.id)} style={deleteActionBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const formStyle = { display: "flex", gap: "15px", marginBottom: "30px", alignItems: "flex-end" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px", color: "#555" };
const inputStyle = { width:"100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing:"border-box" };

const primaryBtn = { padding: "10px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };
const updateBtn = { padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };
const cancelBtn = { padding: "10px 20px", background: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "white" };
const thStyle = { textAlign: "left", padding: "12px", background: "#eee", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };

const editActionBtn = { padding: "6px 12px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontSize: "12px" };
const deleteActionBtn = { padding: "6px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };

export default SectionManagement;