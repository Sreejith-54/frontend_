import { useState, useEffect } from "react";
import StudentReport from "../StudentReportPage/StudentReportPage";

const StudentListPage = () => {
  // --- States for Filtering ---
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classList, setClassList] = useState([]); // This stores sections
  
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState(""); // Current Section ID

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load: Fetch Departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/depts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setDepts(data);
      } catch (err) {
        console.error("Error loading departments:", err);
      }
    };
    fetchDepts();
  }, []);

  // 2. Cascade: Fetch Batches when Dept changes
  useEffect(() => {
    const fetchBatches = async () => {
      if (!selectedDept) {
        setBatches([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/batches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          // Filter batches by the selected department ID
          setBatches(data.filter(b => b.dept_id === parseInt(selectedDept)));
        }
      } catch (err) {
        console.error("Error loading batches:", err);
      }
    };
    fetchBatches();
    setSelectedBatch(""); // Reset downstream
    setSelectedClass("");
  }, [selectedDept]);

  // 3. Cascade: Fetch Sections when Batch changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedBatch) {
        setClassList([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/sections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          // Filter sections by the selected batch ID
          setClassList(data.filter(s => s.batch_id === parseInt(selectedBatch)));
        }
      } catch (err) {
        console.error("Error loading sections:", err);
      }
    };
    fetchSections();
    setSelectedClass(""); // Reset downstream
  }, [selectedBatch]);

  // 4. Fetch Students when Section (selectedClass) changes
  useEffect(() => {
    const fetchStudentsByClass = async () => {
      if (!selectedClass) {
        setStudents([]);
        return;
      }
      
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/students-by-filter?section_id=${selectedClass}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (response.ok) {
          setStudents(data);
        }
      } catch (error) {
        console.error("Network Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsByClass();
  }, [selectedClass]);

  function handleViewReport(student) {
    setSelectedStudent(student);
  }

  return (
    <div className="App">
      <main>
        {!selectedStudent ? (
          <div>
            {/* TOP CONTROLS: Three Cascading Dropdowns */}
            <div style={filterContainerStyle}>
              {/* Dept Dropdown */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={labelStyle}>Dept: </label>
                <select
                  style={selectStyle}
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">Select</option>
                  {depts.map((d) => (
                    <option key={d.id} value={d.id}>{d.dept_code}</option>
                  ))}
                </select>
              </div>

              {/* Batch Dropdown */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={labelStyle}>Batch: </label>
                <select
                  style={selectStyle}
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  disabled={!selectedDept}
                >
                  <option value="">Select</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.batch_name}</option>
                  ))}
                </select>
              </div>

              {/* Section Dropdown */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={labelStyle}>Section: </label>
                <select
                  style={selectStyle}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={!selectedBatch}
                >
                  <option value="">Select</option>
                  {classList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.section_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STUDENT LIST */}
            <div style={listContainerStyle}>
              <div style={headerRowStyle}>
                <span>Roll No</span>
                <span>Student Name</span>
                <span>Action</span>
              </div>

              {loading ? (
                <p style={{ textAlign: "center" }}>Loading students...</p>
              ) : students.length > 0 ? (
                students.map((s) => (
                  <div key={s.id} style={dataRowStyle}>
                    <span>{s.roll_number}</span>
                    <span>{s.full_name}</span>
                    <button style={viewBtnStyle} onClick={() => handleViewReport(s)}>
                      View report
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#666" }}>
                  {selectedClass ? "No students found in this class." : "Please select filters to view students."}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <button style={backBtnStyle} onClick={() => setSelectedStudent(null)}>
              Back
            </button>
            <StudentReport
              StudentName={selectedStudent.full_name}
              RollNo={selectedStudent.roll_number}
              studentId={selectedStudent.id} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

const filterContainerStyle = { display: "flex", justifyContent: "space-between", backgroundColor: "#f0f0f0", margin: "30px 20px", padding: "40px 20px", borderRadius: "8px", gap: "10px" };
const labelStyle = { fontSize: "2vh", fontWeight: "600" };
const selectStyle = { fontSize: "1.5vh", padding: "10px 1vw", marginLeft: "10px", minWidth: "150px" };
const listContainerStyle = { backgroundColor: "#f0f0f0", margin: "30px 20px", padding: "30px", borderRadius: "8px", minHeight: "200px" };
const headerRowStyle = { display: "grid", gridTemplateColumns: "2fr 3fr 1fr", fontSize: "2vh", fontWeight: "bold", marginBottom: "20px", paddingLeft: "20px" };
const dataRowStyle = { backgroundColor: "white", borderRadius: "30px", padding: "15px 25px", marginBottom: "15px", display: "grid", gridTemplateColumns: "2fr 3fr 1fr", alignItems: "center", fontSize: "2vh" };
const viewBtnStyle = { padding: "6px 18px", borderRadius: "20px", border: "none", backgroundColor: "#e0e0e0", cursor: "pointer" };
const backBtnStyle = { fontSize: '1.5vh', fontWeight: 'bold', padding: '1vh 3vw', margin: '30px 10px 0px 10px', backgroundColor: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

export default StudentListPage;
