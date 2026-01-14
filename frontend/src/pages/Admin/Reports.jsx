import { useState } from "react";
import StudentListPage from "../StudentListPage/StudentListPage.jsx";
import SubjectWiseReport from "../SubjectWiseReport/SubjectWiseReport.jsx";

const Reports = () => {
  const [page, setPage] = useState("");
  function handleCardClick(path) {
    setPage(path);
  }

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {/* STUDENT REPORT */}
        <div style={cardStyle} onClick={() => handleCardClick("StudentListPage")}>
          <h4>Student Report</h4>
          <p>View attendance details of an individual student.</p>
        </div>

        {/* SUBJECT-WISE REPORT */}
        <div style={cardStyle} onClick={() => handleCardClick("SubjectWiseReport")}>
          <h4>Subject-wise Report</h4>
          <p>View attendance of students for a specific subject.</p>
        </div>
      </div>
      <div>
        {page === "StudentListPage" && <StudentListPage />}
        {page === "SubjectWiseReport" && <SubjectWiseReport />}
      </div>
    </div>
  );
};

/* ================= STYLES ================= */

const cardStyle = {
  backgroundColor: "#f0f0f0",
  padding: "20px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "0.2s",
};

export default Reports;
