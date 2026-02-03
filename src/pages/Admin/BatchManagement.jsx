

import { useState, useEffect, useRef  } from "react";
import api from "../utils/api";

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [depts, setDepts] = useState([]);
  const [deptSearch, setDeptSearch] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const deptDropdownRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    dept_id: "",
    start_year: "",
    end_year: "",
    batch_name: "",
  });

  // Edit Mode State
  const [editId, setEditId] = useState(null);

  // 1. Fetch Data
  const fetchData = async () => {
    try {
      const [batchRes, deptRes] = await Promise.all([
        api.get("/admin/batches"),
        api.get("/admin/depts")
      ]);
      setBatches(batchRes.data);
      setDepts(deptRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
  const close = (e) => { if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) setDeptOpen(false); };
  document.addEventListener("mousedown", close);
  return () => document.removeEventListener("mousedown", close);
}, []);

  // 2. Handle Form Submit (Create OR Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // --- UPDATE MODE ---
        await api.put(`/admin/batches/${editId}`, {
          start_year: formData.start_year,
          end_year: formData.end_year,
          batch_name: formData.batch_name
          // Note: Your backend PUT API does not update dept_id, so we only send the others
        });
        alert("Batch Updated Successfully!");
      } else {
        // --- CREATE MODE ---
        await api.post("/admin/batches", formData);
        alert("Batch Added Successfully!");
      }

      // Reset
      setFormData({ dept_id: "", start_year: "", end_year: "", batch_name: "" });
      setEditId(null);
      fetchData();

    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  // 3. Handle Edit Click
  const handleEdit = (batch) => {
    setEditId(batch.id);
    setFormData({
      dept_id: batch.dept_id,
      start_year: batch.start_year,
      end_year: batch.end_year,
      batch_name: batch.batch_name
    });
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Handle Cancel Edit
  const handleCancel = () => {
    setEditId(null);
    setFormData({ dept_id: "", start_year: "", end_year: "", batch_name: "" });
  };

  // 5. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This might fail if the batch has sections attached.")) return;

    try {
      await api.delete(`/admin/batches/${id}`);
      alert("Batch Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Ensure no sections/students depend on this batch.");
    }
  };

  return (
    <div>
      <h3>{editId ? "Edit Batch" : "Add New Batch"}</h3>

      <form onSubmit={handleSubmit} style={{ ...formStyle, flexWrap: "wrap", alignItems: "flex-end" }}>

        {/* Department (Disabled in Edit Mode because backend doesn't support moving batches between depts in PUT) */}
        <div style={{ flex: "1 0 150px" }}>
          <label style={labelStyle}>Department</label>
          <div style={{ position: "relative", width: "100%" }} ref={deptDropdownRef}>
            <input
              type="text"
              value={deptSearch}
              onChange={(e) => { setDeptSearch(e.target.value); setDeptOpen(true); }}
              onFocus={() => setDeptOpen(true)}
              placeholder={depts.find((d) => d.id == formData.dept_id)?.dept_code || "Select Dept"}
              disabled={!!editId}
              style={{ ...inputStyle, width: "100%", background: editId ? "#eee" : "white" }}
            />

            {deptOpen && !editId && (
              <ul style={{ position: "absolute", width: "100%", background: "white", border: "1px solid #ccc", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, margin: "4px 0 0" }}>
                {depts
                  .filter((d) => d.dept_code.toLowerCase().includes(deptSearch.toLowerCase()))
                  .map((d) => (
                    <li
                      key={d.id}
                      onClick={() => { setFormData({ ...formData, dept_id: d.id }); setDeptSearch(""); setDeptOpen(false); }}
                      style={{ padding: "8px 12px", cursor: "pointer" }}
                    >
                      {d.dept_code}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        <div style={{ flex: "1 0 100px" }}>
          <label style={labelStyle}>Start Year</label>
          <input
            type="number"
            style={{ ...inputStyle, width: "100%" }}
            value={formData.start_year}
            onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
            required
          />
        </div>

        <div style={{ flex: "1 0 100px" }}>
          <label style={labelStyle}>End Year</label>
          <input
            type="number"
            style={{ ...inputStyle, width: "100%" }}
            value={formData.end_year}
            onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
            required
          />
        </div>

        <div style={{ flex: "1 0 150px" }}>
          <label style={labelStyle}>Batch Name</label>
          <input
            style={{ ...inputStyle, width: "100%" }}
            placeholder="e.g. 2023-2027"
            value={formData.batch_name}
            onChange={(e) => setFormData({ ...formData, batch_name: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '5px' }}>
          <button type="submit" style={editId ? updateBtn : primaryBtn}>
            {editId ? "Update Batch" : "Add Batch"}
          </button>

          {editId && (
            <button type="button" onClick={handleCancel} style={cancelBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3>Existing Batches</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Batch Name</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Duration</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => (
            <tr key={b.id}>
              <td style={tdStyle}><strong>{b.batch_name}</strong></td>
              <td style={tdStyle}>{b.dept_code}</td>
              <td style={tdStyle}>{b.start_year} - {b.end_year}</td>
              <td style={tdStyle}>
                <button onClick={() => handleEdit(b)} style={editActionBtn}>Edit</button>
                <button onClick={() => handleDelete(b.id)} style={deleteActionBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Styles
const formStyle = { display: "flex", gap: "10px", marginBottom: "30px" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px", color: "#555" };
const inputStyle = { padding: "10px", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" };

const primaryBtn = { padding: "10px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };
const updateBtn = { padding: "10px 20px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };
const cancelBtn = { padding: "10px 20px", background: "#95a5a6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", height: "38px" };

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "white" };
const thStyle = { textAlign: "left", padding: "12px", background: "#eee", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };

const editActionBtn = { padding: "6px 12px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "5px", fontSize: "12px" };
const deleteActionBtn = { padding: "6px 12px", background: "#e74c3c", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };

export default BatchManagement;