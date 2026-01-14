import { useState } from "react";

const ClassManagement = () => {
  const [selectedBatch, setSelectedBatch] = useState(1);

  const batches = [
    {
      id: 1,
      degree: "B.Tech",
      branch: "CSE",
      startYear: 2024,
      endYear: 2028,
    },
    {
      id: 2,
      degree: "B.Tech",
      branch: "AI",
      startYear: 2024,
      endYear: 2028,
    },
  ];

  const classes = [
    { id: 1, batchId: 1, section: "A", strength: 45, cr: "John Doe", active: true },
    { id: 2, batchId: 1, section: "B", strength: 42, cr: "Alice", active: true },
    { id: 3, batchId: 2, section: "A", strength: 40, cr: "—", active: false },
  ];

  return (
    <div>
      {/* BATCH SELECT */}
      <div style={{ marginBottom: "25px" }}>
        <label style={{ fontWeight: "bold" }}>Select Batch: </label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(Number(e.target.value))}
          style={{ padding: "6px 12px", marginLeft: "10px" }}
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.degree} {b.branch} ({b.startYear}-{b.endYear})
            </option>
          ))}
        </select>

        <button style={primaryBtn}>+ Add Class</button>
      </div>

      {/* CLASS TABLE */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Section</th>
            <th>Class Strength</th>
            <th>Class Representative</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {classes
            .filter((c) => c.batchId === selectedBatch)
            .map((cls) => (
              <tr key={cls.id}>
                <td>CSE-{cls.section}</td>
                <td>{cls.strength}</td>
                <td>{cls.cr}</td>
                <td>{cls.active ? "Active" : "Inactive"}</td>
                <td>
                  <button style={actionBtn}>
                    {cls.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

/* ================= STYLES ================= */

const primaryBtn = {
  marginLeft: "20px",
  padding: "8px 16px",
  backgroundColor: "#AD3A3C",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const actionBtn = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#ddd",
  cursor: "pointer",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

export default ClassManagement;
