

import { useState, useEffect, useRef } from "react";
import api from "../utils/api";

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchSearch, setBatchSearch] = useState("");
  const [batchOpen, setBatchOpen] = useState(false);
  const batchDropdownRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({ batch_id: "", section_name: "" });
  const [editId, setEditId] = useState(null);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const [secRes, batchRes] = await Promise.all([
        api.get("/api/admin/sections"),
        api.get("/api/admin/batches")
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

  useEffect(() => {
    const close = (e) => {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(e.target)) setBatchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // 2. Handle Submit (Create or Update)
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (editId) {
      // --- UPDATE MODE ---
      await api.post(`/api/admin/edit/sections/${editId}`, {
        section_name: formData.section_name
      });
      alert("Section Updated!");
    } else {
      // --- CREATE MODE ---
      await api.post("/api/admin/sections", formData);
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
      await api.post(`/api/admin/delete/sections/${id}`);
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
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Batch</label>
          <div style={{ position: "relative" }} ref={batchDropdownRef}>
            <input
              type="text"
              value={batchSearch}
              onChange={(e) => { setBatchSearch(e.target.value); setBatchOpen(true); }}
              onFocus={() => setBatchOpen(true)}
              placeholder={batches.find((b) => b.id == formData.batch_id) ? `${batches.find((b) => b.id == formData.batch_id).batch_name} (${batches.find((b) => b.id == formData.batch_id).dept_code})` : "Select Batch"}
              disabled={!!editId}
              style={{ ...inputStyle, background: editId ? "#eee" : "white" }}
            />

            {batchOpen && !editId && (
              <ul style={{ position: "absolute", width: "100%", background: "white", border: "1px solid #ccc", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, margin: "4px 0 0" }}>
                {batches
                  .filter((b) => `${b.batch_name} (${b.dept_code})`.toLowerCase().includes(batchSearch.toLowerCase()))
                  .map((b) => (
                    <li
                      key={b.id}
                      onClick={() => { setFormData({ ...formData, batch_id: b.id }); setBatchSearch(""); setBatchOpen(false); }}
                      style={{ padding: "8px 12px", cursor: "pointer" }}
                    >
                      {b.batch_name} ({b.dept_code})
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Section Name</label>
          <input
            style={inputStyle}
            placeholder="e.g. A, B, C"
            value={formData.section_name}
            onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
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
const inputStyle = { width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" };

const primaryBtn = { padding: "10px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };
const updateBtn = { padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };
const cancelBtn = { padding: "10px 20px", background: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "white" };
const thStyle = { textAlign: "left", padding: "12px", background: "#eee", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };

const editActionBtn = { padding: "6px 12px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontSize: "12px" };
const deleteActionBtn = { padding: "6px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };

export default SectionManagement;