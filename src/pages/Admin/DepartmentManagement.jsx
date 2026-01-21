import { useState, useEffect } from "react";
import api from "../utils/api";
import SuccessPopup from "../../components/SuccessPopup";

const DepartmentManagement = () => {
  const [depts, setDepts] = useState([]);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [showPopup, setShowPopup] = useState(false);

  const fetchDepts = async () => {
    try {
      const res = await api.get("/admin/depts");
      setDepts(res.data);
    } catch (err) {
      alert("Failed to fetch departments");
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/depts", formData);
      setFormData({ name: "", code: "" });
      fetchDepts();
      setShowPopup(true); 
    } catch (err) {
      alert("Error adding department: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/admin/depts/${id}`);
      fetchDepts();
    } catch (err) {
      alert("Error deleting department");
    }
  };

  return (
    <div>
      <h3>Add Department</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          style={inputStyle}
          placeholder="Department Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          style={inputStyle}
          placeholder="Code"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          required
        />
        <button type="submit" style={primaryBtn}>Add Department</button>
      </form>

      <h3>Existing Departments</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Code</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {depts.map((d) => (
            <tr key={d.id}>
              <td style={tdStyle}>{d.id}</td>
              <td style={tdStyle}>{d.dept_code}</td>
              <td style={tdStyle}>{d.dept_name}</td>
              <td style={tdStyle}>
                <button onClick={() => handleDelete(d.id)} style={dangerBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* REUSABLE POPUP */}
      <SuccessPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        message="Department added successfully!" 
      />
    </div>
  );
};

const formStyle = { display: "flex", gap: "10px", marginBottom: "30px", alignItems: "center" };
const inputStyle = { padding: "10px", border: "1px solid #ddd", borderRadius: "4px", flex: 1 };
const primaryBtn = { padding: "10px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const dangerBtn = { padding: "5px 10px", background: "#ff4d4f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px" };
const thStyle = { textAlign: "left", padding: "12px", background: "#eee", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };


export default DepartmentManagement;
