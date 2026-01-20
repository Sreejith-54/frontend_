// // import { useState, useEffect } from "react";
// // import api from "../utils/api";
// // import "./dashboard1.css";

// // export default function MonthlyAttendanceDashboard() {
// //   // Dropdown Data
// //   const [depts, setDepts] = useState([]);
// //   const [batches, setBatches] = useState([]);
// //   const [sections, setSections] = useState([]);
// //   const [courses, setCourses] = useState([]);
// //   const [timetable, setTimetable] = useState([]);

// //   // Selections
// //   const [deptId, setDeptId] = useState("");
// //   const [batchId, setBatchId] = useState("");
// //   const [sectionId, setSectionId] = useState("");
// //   const [semester, setSemester] = useState("");
// //   const [courseCode, setCourseCode] = useState("");
// //   const [month, setMonth] = useState("");

// //   // Attendance Data
// //   const [data, setData] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   /* ================= DROPDOWNS ================= */

// //   useEffect(() => {
// //     api.get("/admin/depts").then(res => setDepts(res.data));
// //   }, []);

// //   useEffect(() => {
// //     if (!deptId) return setBatches([]);
// //     api.get("/admin/batches")
// //       .then(res => setBatches(res.data.filter(b => b.dept_id === +deptId)));
// //   }, [deptId]);

// //   useEffect(() => {
// //     if (!batchId) return setSections([]);
// //     api.get("/admin/sections")
// //       .then(res => setSections(res.data.filter(s => s.batch_id === +batchId)));
// //   }, [batchId]);

// //   useEffect(() => {
// //     if (!sectionId || !semester) {
// //       setCourses([]);
// //       return;
// //     }
  
// //     api.get("/common/timetable", {
// //       params: { section_id: sectionId, semester }
// //     }).then(res => {
// //       setTimetable(res.data);
// //       // Extract unique courses from timetable
// //       const uniqueCourses = [];
// //       const seen = new Set();
      
// //       res.data.forEach(slot => {
// //         if (!seen.has(slot.course_code)) {
// //           seen.add(slot.course_code);
// //           uniqueCourses.push({
// //             course_code: slot.course_code,
// //             course_name: slot.course_name
// //           });
// //         }
// //       });
      
// //       setCourses(uniqueCourses);
// //     });
// //   }, [sectionId, semester]);

// //   /* ================= FETCH ATTENDANCE ================= */

// // const fetchAttendance = async () => {
// //   if (!sectionId || !semester || !courseCode || !month) {
// //     alert("Select all fields");
// //     return;
// //   }

// //   // STRICT: month must be YYYY-MM
// //   if (!/^\d{4}-\d{2}$/.test(month)) {
// //     alert("Month must be in YYYY-MM format");
// //     return;
// //   }

// //   setLoading(true);
// //   setData([]);

// //   try {
// //     const res = await api.get("/attendance/periodic", {
// //       params: {
// //         sectionId: Number(sectionId),
// //         semester: Number(semester),
// //         courseCode: courseCode,
// //         month: month // e.g. "2025-01"
// //       }
// //     });
// //     console.log("Attendance Data:", res.data);

// //     setData(res.data);

// //   } catch (err) {
// //     console.error("Attendance fetch error:", err);
// //     alert(err.response?.data?.error || "Failed to load attendance");
// //   } finally {
// //     setLoading(false);
// //   }
// // };


// //   return (
// //     <div className="monthly-attendance">

// //       {/* FILTER BAR */}
// //       <div className="filters">
// //         <select onChange={e => setDeptId(e.target.value)} value={deptId}>
// //           <option value="">Dept</option>
// //           {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
// //         </select>

// //         <select onChange={e => setBatchId(e.target.value)} value={batchId} disabled={!deptId}>
// //           <option value="">Batch</option>
// //           {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
// //         </select>

// //         <select onChange={e => setSectionId(e.target.value)} value={sectionId} disabled={!batchId}>
// //           <option value="">Section</option>
// //           {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
// //         </select>

// //         <select onChange={e => setSemester(e.target.value)} value={semester}>
// //           <option value="">Semester</option>
// //           {[1,2,3,4,5,6,7,8].map(n => (
// //             <option key={n} value={n}>Sem {n}</option>
// //           ))}
// //         </select>

// //         <select onChange={e => setCourseCode(e.target.value)} value={courseCode} disabled={!semester}>
// //           <option value="">Course</option>
// //           {courses.map(c => (
// //             <option key={c.course_code} value={c.course_code}>
// //               {c.course_name}
// //             </option>
// //           ))}
// //         </select>

// //         <input type="month" value={month} onChange={e => setMonth(e.target.value)} />

// //         <button style={{ padding: "8px 20px", background: "#AD3A3C", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginLeft:'auto' }} onClick={fetchAttendance}>Fetch</button>
// //       </div>

// //       {/* TABLE */}
// //       <div className="attendance-row header">
// //         <div className="student-name">Student</div>
// //         <div className="attendance-days">Attendance</div>
// //         <div className="attendance-summary">Total</div>
// //       </div>

// //       {loading && <p>Loading...</p>}

// //       {data.map((s, i) => (
// //         <div className="attendance-row" key={i}>
// //           <div className="student-name">{s.studentName}</div>
// //           <div className="attendance-days">
// //             {s.records.map((r, idx) => (
// //               <span key={idx} className={`day-box ${r.status}`} />
// //             ))}
// //           </div>

// //           <div className="attendance-summary">{s.attended} present </div>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }

// import { useState, useEffect } from "react";
// import api from "../utils/api";
// import "./dashboard1.css";

// export default function MonthlyAttendanceDashboard() {
//   // Dropdown Data
//   const [depts, setDepts] = useState([]);
//   const [batches, setBatches] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [courses, setCourses] = useState([]);
//   const [timetable, setTimetable] = useState([]);

//   // Selections
//   const [deptId, setDeptId] = useState("");
//   const [batchId, setBatchId] = useState("");
//   const [sectionId, setSectionId] = useState("");
//   const [semester, setSemester] = useState("");
//   const [courseCode, setCourseCode] = useState("");
//   const [month, setMonth] = useState("");

//   // Attendance Data
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= DROPDOWNS ================= */

//   useEffect(() => {
//     api.get("/admin/depts").then(res => setDepts(res.data));
//   }, []);

//   useEffect(() => {
//     if (!deptId) return setBatches([]);
//     api.get("/admin/batches")
//       .then(res => setBatches(res.data.filter(b => b.dept_id === +deptId)));
//   }, [deptId]);

//   useEffect(() => {
//     if (!batchId) return setSections([]);
//     api.get("/admin/sections")
//       .then(res => setSections(res.data.filter(s => s.batch_id === +batchId)));
//   }, [batchId]);

//   useEffect(() => {
//     if (!sectionId || !semester) {
//       setCourses([]);
//       return;
//     }
  
//     api.get("/common/timetable", {
//       params: { section_id: sectionId, semester }
//     }).then(res => {
//       setTimetable(res.data);
//       const uniqueCourses = [];
//       const seen = new Set();
//       res.data.forEach(slot => {
//         if (!seen.has(slot.course_code)) {
//           seen.add(slot.course_code);
//           uniqueCourses.push({
//             course_code: slot.course_code,
//             course_name: slot.course_name
//           });
//         }
//       });
//       setCourses(uniqueCourses);
//     });
//   }, [sectionId, semester]);

//   /* ================= FETCH ATTENDANCE ================= */

//   const fetchAttendance = async () => {
//     if (!sectionId || !semester || !courseCode || !month) {
//       alert("Select all fields");
//       return;
//     }
//     if (!/^\d{4}-\d{2}$/.test(month)) {
//       alert("Month must be in YYYY-MM format");
//       return;
//     }

//     setLoading(true);
//     setData([]);

//     try {
//       const res = await api.get("/attendance/periodic", {
//         params: {
//           sectionId: Number(sectionId),
//           semester: Number(semester),
//           courseCode: courseCode,
//           month: month
//         }
//       });
//       setData(res.data);
//     } catch (err) {
//       console.error("Attendance fetch error:", err);
//       alert(err.response?.data?.error || "Failed to load attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper to get date headers from the first student record
//   const headerRecords = data.length > 0 ? data[0].records : [];

//   return (
//     <div className="monthly-attendance">

//       {/* FILTER BAR */}
//       <div className="filters">
//         <select onChange={e => setDeptId(e.target.value)} value={deptId}>
//           <option value="">Dept</option>
//           {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
//         </select>

//         <select onChange={e => setBatchId(e.target.value)} value={batchId} disabled={!deptId}>
//           <option value="">Batch</option>
//           {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
//         </select>

//         <select onChange={e => setSectionId(e.target.value)} value={sectionId} disabled={!batchId}>
//           <option value="">Section</option>
//           {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
//         </select>

//         <select onChange={e => setSemester(e.target.value)} value={semester}>
//           <option value="">Semester</option>
//           {[1,2,3,4,5,6,7,8].map(n => (
//             <option key={n} value={n}>Sem {n}</option>
//           ))}
//         </select>

//         <select onChange={e => setCourseCode(e.target.value)} value={courseCode} disabled={!semester}>
//           <option value="">Course</option>
//           {courses.map(c => (
//             <option key={c.course_code} value={c.course_code}>
//               {c.course_name}
//             </option>
//           ))}
//         </select>

//         <input type="month" value={month} onChange={e => setMonth(e.target.value)} />

//         <button className="fetch-btn" onClick={fetchAttendance}>Fetch</button>
//       </div>

//       {loading && <p>Loading...</p>}

//       {/* HEADER ROW WITH DATES */}
//       {data.length > 0 && (
//         <div className="attendance-row header">
//           <div className="student-name">Student Name</div>
          
//           <div className="attendance-days header-scroll">
//             {headerRecords.map((rec, idx) => {
//               const dateObj = new Date(rec.date);
//               const day = dateObj.getDate();
//               return (
//                 <div key={idx} className="date-header-cell">
//                   <span className="date-num">{day}</span>
//                   {/* <span className="slot-num">S{rec.slot}</span> */}
//                 </div>
//               );
//             })}
//           </div>

//           <div className="attendance-summary">Total</div>
//         </div>
//       )}

//       {/* DATA ROWS */}
//       {data.map((s, i) => (
//         <div className="attendance-row" key={i}>
//           <div className="student-name">{s.studentName}</div>
          
//           <div className="attendance-days">
//             {s.records.map((r, idx) => (
//               <div key={idx} className="box-wrapper">
//                 <span className={`day-box ${r.status}`} title={`${r.date} (Slot ${r.slot}): ${r.status}`} />
//               </div>
//             ))}
//           </div>

//           <div className="attendance-summary">
//              {s.attended}/{s.total} <br/>
//              <small>{((s.attended/s.total)*100).toFixed(0)}%</small>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import api from "../utils/api";
import "./dashboard1.css";

export default function MonthlyAttendanceDashboard() {
  // Dropdown Data
  const [depts, setDepts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);

  // Selections
  const [deptId, setDeptId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [semester, setSemester] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [month, setMonth] = useState("");

  // Attendance Data
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= DROPDOWNS ================= */

  useEffect(() => {
    api.get("/admin/depts").then(res => setDepts(res.data));
  }, []);

  useEffect(() => {
    if (!deptId) return setBatches([]);
    api.get("/admin/batches")
      .then(res => setBatches(res.data.filter(b => b.dept_id === +deptId)));
  }, [deptId]);

  useEffect(() => {
    if (!batchId) return setSections([]);
    api.get("/admin/sections")
      .then(res => setSections(res.data.filter(s => s.batch_id === +batchId)));
  }, [batchId]);

  useEffect(() => {
    if (!sectionId || !semester) {
      setCourses([]);
      return;
    }
  
    api.get("/common/timetable", {
      params: { section_id: sectionId, semester }
    }).then(res => {
      setTimetable(res.data);
      const uniqueCourses = [];
      const seen = new Set();
      res.data.forEach(slot => {
        if (!seen.has(slot.course_code)) {
          seen.add(slot.course_code);
          uniqueCourses.push({
            course_code: slot.course_code,
            course_name: slot.course_name
          });
        }
      });
      setCourses(uniqueCourses);
    });
  }, [sectionId, semester]);

  /* ================= FETCH ATTENDANCE ================= */

  const fetchAttendance = async () => {
    if (!sectionId || !semester || !courseCode || !month) {
      alert("Select all fields");
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
      alert("Month must be in YYYY-MM format");
      return;
    }

    setLoading(true);
    setData([]);

    try {
      const res = await api.get("/attendance/periodic", {
        params: {
          sectionId: Number(sectionId),
          semester: Number(semester),
          courseCode: courseCode,
          month: month
        }
      });
      setData(res.data);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      alert(err.response?.data?.error || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get date headers from the first student record
  const headerRecords = data.length > 0 ? data[0].records : [];

  return (
    <div className="monthly-attendance">

      {/* FILTER BAR */}
      <div className="filters">
        <select onChange={e => setDeptId(e.target.value)} value={deptId}>
          <option value="">Dept</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.dept_code}</option>)}
        </select>

        <select onChange={e => setBatchId(e.target.value)} value={batchId} disabled={!deptId}>
          <option value="">Batch</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
        </select>

        <select onChange={e => setSectionId(e.target.value)} value={sectionId} disabled={!batchId}>
          <option value="">Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.section_name}</option>)}
        </select>

        <select onChange={e => setSemester(e.target.value)} value={semester}>
          <option value="">Semester</option>
          {[1,2,3,4,5,6,7,8].map(n => (
            <option key={n} value={n}>Sem {n}</option>
          ))}
        </select>

        <select onChange={e => setCourseCode(e.target.value)} value={courseCode} disabled={!semester}>
          <option value="">Course</option>
          {courses.map(c => (
            <option key={c.course_code} value={c.course_code}>
              {c.course_name}
            </option>
          ))}
        </select>

        <input type="month" value={month} onChange={e => setMonth(e.target.value)} />

        <button className="fetch-btn" onClick={fetchAttendance}>Fetch</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* HEADER ROW WITH DATES */}
      {data.length > 0 && (
        <div className="attendance-row header">
          <div className="student-name">Student Name</div>
          
          <div className="attendance-days header-scroll">
            {headerRecords.map((rec, idx) => {
              const dateObj = new Date(rec.date);
              const day = dateObj.getDate();
              return (
                <div key={idx} className="date-header-cell">
                  <span className="date-num">{day}</span>
                </div>
              );
            })}
          </div>

          <div className="attendance-summary">Total</div>
        </div>
      )}

      {/* DATA ROWS */}
      {data.map((s, i) => {
        // --- CALCULATION LOGIC CHANGE START ---
        // Calculate counts locally to include 'late' as present
        const totalClasses = s.records.length;
        const attendedCount = s.records.filter(r => 
          r.status.toLowerCase() === 'present' || 
          r.status.toLowerCase() === 'late'
        ).length;
        
        const percentage = totalClasses > 0 
          ? ((attendedCount / totalClasses) * 100).toFixed(0) 
          : 0;
        // --- CALCULATION LOGIC CHANGE END ---

        return (
          <div className="attendance-row" key={i}>
            <div className="student-name">{s.studentName}</div>
            
            <div className="attendance-days">
              {s.records.map((r, idx) => (
                <div key={idx} className="box-wrapper">
                  <span className={`day-box ${r.status}`} title={`${r.date} (Slot ${r.slot}): ${r.status}`} />
                </div>
              ))}
            </div>

            <div className="attendance-summary">
               {attendedCount}/{totalClasses} <br/>
               <small>{percentage}%</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}