import {useState} from "react";
import StudentReport from "../StudentReportPage/StudentReportPage";

const students = [
  { roll: "AM.SC.U5CSE24654", name: "John Doe" },
  { roll: "AM.SC.U5CSE24655", name: "Jane Smith" },
  { roll: "AM.SC.U5CSE24656", name: "Alex Brown" },
];

const StudentListPage = () => {
  const [selectedStudent, setSelectedStudent] = useState([]);
  function handleViewReport(student) {
    // Logic to view the report of the selected student
    setSelectedStudent(student);
  }
  return (
    <div className="App">

      {/* MAIN */}
      <main>
        {/* TOP CONTROLS */}
        {selectedStudent.length === 0 &&
        <div>
          <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#f0f0f0",
            margin: "30px 20px",
            padding: "40px 20px",
            borderRadius: "8px",
          }}
        >
          <div >
            <label style={{ fontSize: "2vh", fontWeight: '600' }}>Select Class: </label>
            <select
              style={{
                fontSize: "1.5vh",
                padding: "10px 5vw",
                marginLeft: "10px",
              }}
            >
              <option>Select</option>
              <option>CSE A</option>
              <option>CSE B</option>
            </select>
          </div>
        </div>

        {/* STUDENT LIST */}
        <div
          style={{
            backgroundColor: "#f0f0f0",
            margin: "30px 20px",
            padding: "30px",
            borderRadius: "8px",
          }}
        >
          {/* HEADER ROW */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 3fr 1fr",
              fontSize: "2vh",
              fontWeight: "bold",
              marginBottom: "20px",
              paddingLeft: "20px",
            }}
          >
            <span>Roll No</span>
            <span>Student Name</span>
            <span></span>
          </div>

          {/* DATA ROWS */}
          {students.map((s, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "white",
                borderRadius: "30px",
                padding: "15px 25px",
                marginBottom: "15px",
                display: "grid",
                gridTemplateColumns: "2fr 3fr 1fr",
                alignItems: "center",
                fontSize: "2vh",
              }}
            >
              <span>{s.roll}</span>
              <span>{s.name}</span>
              <button
                style={viewBtnStyle}
                onClick={() => handleViewReport(s)}
              >
                View report
              </button>
            </div>
          ))}
        </div>
        </div>
        } 
        {selectedStudent.length !== 0 &&
        <div>
        <button style={{fontSize: '1.5vh', fontWeight: 'bold', padding: '1vh 3vw', margin: '30px 10px 0px 10px', backgroundColor: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }} onClick={() => setSelectedStudent([])}>Back</button>
        <StudentReport
          StudentName={selectedStudent.name}
          RollNo={selectedStudent.roll}
        />
        </div>
        }
      </main>
    </div>
  );
};

/* ===== COMMON INLINE STYLES ===== */


const viewBtnStyle = {
  padding: "6px 18px",
  borderRadius: "20px",
  border: "none",
  backgroundColor: "#e0e0e0",
  cursor: "pointer",
};

export default StudentListPage;
