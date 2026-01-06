import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import StudentListPage from "./pages/StudentListPage/StudentListPage";
import StudentReport from "./pages/StudentReportPage";
import FacultyDashboard from './pages/Faculty/FacultyDashboard';
import ClassStatus from './pages/ClassStatus';
import SubjectWiseReport from './pages/SubjectWiseReport/SubjectWiseReport';
import MainLayout from './components/MainLayout';

const candid = {
  StudentName: "John Doe",
  RollNo: "AM.SC.U5CSE24654",
};

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/cr" element={<MainLayout />}>
            <Route path="attendance" element={<ClassStatus />} />
          </Route>

          <Route path="/admin" element={<MainLayout />}>
            <Route index element={<FacultyDashboard />} /> 
            <Route path="attendance" element={<ClassStatus />} />
            <Route path="studentlist" element={<StudentListPage />} />
            <Route
              path="student-report"
              element={
                <StudentReport
                  StudentName={candid.StudentName}
                  RollNo={candid.RollNo}
                />
              }
            />
            <Route path="subject-report" element={<SubjectWiseReport />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
