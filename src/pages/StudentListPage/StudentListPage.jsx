import { useState, useEffect } from "react";
import StudentReport from "../StudentReportPage/StudentReportPage";

const StudentListPage = () => {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/sections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) setClassList(data);
      } catch (err) {
        console.error("Error loading classes:", err);
      }
    };
    fetchClasses();
  }, []);

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
        } else {
          console.error("Failed to fetch students:", data.error);
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
            <div style={filterContainerStyle}>
              <div>
                <label style={{ fontSize: "2vh", fontWeight: "600" }}>Select Class: </label>
                <select
                  style={selectStyle}
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Select</option>
                  {classList.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.batch_name} - {cls.section_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  {selectedClass ? "No students found in this class." : "Please select a class to view students."}
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

const filterContainerStyle = { display: "flex", justifyContent: "space-between", backgroundColor: "#f0f0f0", margin: "30px 20px", padding: "40px 20px", borderRadius: "8px" };
const selectStyle = { fontSize: "1.5vh", padding: "10px 2vw", marginLeft: "10px" };
const listContainerStyle = { backgroundColor: "#f0f0f0", margin: "30px 20px", padding: "30px", borderRadius: "8px", minHeight: "200px" };
const headerRowStyle = { display: "grid", gridTemplateColumns: "2fr 3fr 1fr", fontSize: "2vh", fontWeight: "bold", marginBottom: "20px", paddingLeft: "20px" };
const dataRowStyle = { backgroundColor: "white", borderRadius: "30px", padding: "15px 25px", marginBottom: "15px", display: "grid", gridTemplateColumns: "2fr 3fr 1fr", alignItems: "center", fontSize: "2vh" };
const viewBtnStyle = { padding: "6px 18px", borderRadius: "20px", border: "none", backgroundColor: "#e0e0e0", cursor: "pointer" };
const backBtnStyle = { fontSize: '1.5vh', fontWeight: 'bold', padding: '1vh 3vw', margin: '30px 10px 0px 10px', backgroundColor: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };

export default StudentListPage;