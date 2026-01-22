

// import React, { useState, useEffect } from 'react';
// // import StudentReportComponent ... (if you use it, or use the table below)

// const StudentReport = (props) => {
//   const [summaryData, setSummaryData] = useState([]); 
//   const [loading, setLoading] = useState(false);
  
//   // Default to Semester 1 or force user to pick
//   const [semester, setSemester] = useState("1"); 
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   useEffect(() => {
//     if (!props.RollNo || !semester) return;
    
//     setLoading(true);
//     const fetchStudentData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const params = new URLSearchParams({
//             roll_number: props.RollNo,
//             semester: semester,
//             ...(startDate && { start_date: startDate }),
//             ...(endDate && { end_date: endDate })
//         });

//         const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-report?${params.toString()}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (response.ok) {
//           const data = await response.json();
//           // Map backend data to frontend structure
//           const formattedSummary = data.map((item) => ({
//             courseID: item.course_code,
//             Subject: item.course_name,
//             Attendence: item.attended_classes, // Note: check your prop names in Component
//             totalClasses: item.total_classes,
//             percentage: item.attendance_percentage
//           }));
//           setSummaryData(formattedSummary);
//         } else {
//             setSummaryData([]);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudentData();
//   }, [props.RollNo, semester, startDate, endDate]);

//   return (
//     <div className="StudentReportPage">
//         {/* Header with Filters */}
//         <div style={headerContainerStyle}>
//           <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
//             <p>Name : {props.StudentName}</p>
//             <p>Roll No : {props.RollNo}</p>
//           </div>
          
//           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
//             <div>
//                 <label style={{marginRight: '5px', fontWeight:'bold'}}>Sem:</label>
//                 <select value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle}>
//                     {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
//                 </select>
//             </div>
//             <div>
//                 <label style={{marginRight: '5px'}}>From:</label>
//                 <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
//             </div>
//             <div>
//                 <label style={{marginRight: '5px'}}>To:</label>
//                 <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
//             </div>
//           </div>
//         </div>

//         {/* Report Table */}
//         <div style={{ margin: '30px auto', width: '97%' }}>
//           {loading ? (
//             <p style={{ textAlign: 'center' }}>Loading Report...</p>
//           ) : (
//             <div style={cardContainerStyle}>
//               <table border={0} style={{ width: '90%', borderCollapse: 'separate', borderSpacing: '3px 10px' }}>
//                 <thead>
//                   <tr style={{ height: '7vh', fontSize: '2vh' }}>
//                     <th style={{textAlign:'left'}}>Subject</th>
//                     <th>Attended / Total</th>
//                     <th>Percentage</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {summaryData.length > 0 ? summaryData.map((item, index) => (
//                     <tr key={index} style={{backgroundColor: 'white', height: '50px'}}>
//                         <td style={{textAlign:'left', paddingLeft:'10px'}}>
//                             {item.Subject} <br/> 
//                             <span style={{fontSize:'0.8em', color:'#666'}}>{item.courseID}</span>
//                         </td>
//                         <td>{item.Attendence} / {item.totalClasses}</td>
//                         <td style={{
//                             color: parseFloat(item.percentage) < 75 ? 'red' : 'green',
//                             fontWeight: 'bold'
//                         }}>{item.percentage}%</td>
//                     </tr>
//                   )) : (
//                     <tr><td colSpan="3">No attendance data found for Semester {semester}</td></tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//     </div>
//   );
// }

// const headerContainerStyle = { 
//   display: 'flex', 
//   justifyContent: 'space-between', 
//   backgroundColor: '#f0f0f0', 
//   margin: '30px 20px', 
//   padding: '20px', 
//   borderRadius: '8px',
//   flexWrap: 'wrap',
//   gap: '15px'
// };

// const cardContainerStyle = { 
//   backgroundColor: '#f0f0f0', 
//   margin: '30px auto', 
//   borderRadius: '8px', 
//   textAlign: 'center', 
//   display: 'flex', 
//   justifyContent: 'center', 
//   padding: '20px' 
// };

// const inputStyle = { padding: '5px', borderRadius: '4px', border: '1px solid #ccc' };

// export default StudentReport;


import React, { useState, useEffect } from 'react';
// import StudentReportComponent ... (if you use it, or use the table below)

const StudentReport = (props) => {
  const [summaryData, setSummaryData] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Default to Semester 1
  const [semester, setSemester] = useState("1"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!props.RollNo || !semester) return;
    
    setLoading(true);
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
            roll_number: props.RollNo,
            semester: semester,
            ...(startDate && { start_date: startDate }),
            ...(endDate && { end_date: endDate })
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/student-report?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Map backend data to frontend structure
          const formattedSummary = data.map((item) => ({
            courseID: item.course_code,
            Subject: item.course_name,
            Attendence: item.attended_classes,
            totalClasses: item.total_classes,
            percentage: item.attendance_percentage
          }));
          setSummaryData(formattedSummary);
        } else {
            setSummaryData([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [props.RollNo, semester, startDate, endDate]);

  // --- CSV DOWNLOAD FUNCTION ---
  const downloadCSV = () => {
    if (summaryData.length === 0) return;

    // 1. Define Headers
    const headers = ["Course Code,Subject,Attended,Total Classes,Percentage"];

    // 2. Map Data to Rows
    const rows = summaryData.map(item => {
        // Wrap subject in quotes to handle potential commas in names
        return `${item.courseID},"${item.Subject}",${item.Attendence},${item.totalClasses},${item.percentage}%`;
    });

    // 3. Combine and Download
    const csvContent = headers.concat(rows).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${props.RollNo}_Sem${semester}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="StudentReportPage">
        {/* Header with Filters */}
        <div style={headerContainerStyle}>
          
          {/* Student Details Section */}
          <div style={{ textAlign: 'left', fontWeight: 'bold', marginBottom: '15px' }}>
            <div style={{ fontSize: '1.2rem', color: '#333' }}>Name : {props.StudentName}</div>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>Roll No : {props.RollNo}</div>
          </div>
          
          {/* Filters & Actions Section */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap' }}>
            
            <div style={filterBoxStyle}>
                <label style={labelStyle}>Semester</label>
                <select value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div style={filterBoxStyle}>
                <label style={labelStyle}>From Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={filterBoxStyle}>
                <label style={labelStyle}>To Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={filterBoxStyle}>
                <button 
                    onClick={downloadCSV} 
                    disabled={summaryData.length === 0 || loading}
                    style={{
                        ...buttonStyle,
                        backgroundColor: summaryData.length > 0 ? '#4CAF50' : '#ccc',
                        cursor: summaryData.length > 0 ? 'pointer' : 'not-allowed'
                    }}
                >
                    Download Report
                </button>
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div style={{ margin: '30px auto', width: '97%' }}>
          {loading ? (
            <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading Report...</p>
          ) : (
            <div style={cardContainerStyle}>
              <table border={0} style={{ width: '95%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <thead>
                  <tr style={{ height: '60px', fontSize: '1.1rem', backgroundColor: '#e0e0e0' }}>
                    <th style={{textAlign:'left', paddingLeft: '20px', borderRadius: '8px 0 0 8px'}}>Subject</th>
                    <th>Attended / Total</th>
                    <th style={{borderRadius: '0 8px 8px 0'}}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.length > 0 ? summaryData.map((item, index) => (
                    <tr key={index} style={{backgroundColor: 'white', height: '60px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                        <td style={{textAlign:'left', paddingLeft:'20px', borderRadius: '8px 0 0 8px'}}>
                            <div style={{fontWeight: 'bold', fontSize: '1rem'}}>{item.Subject}</div>
                            <div style={{fontSize:'0.85rem', color:'#666'}}>{item.courseID}</div>
                        </td>
                        <td style={{fontSize: '1.1rem'}}>{item.Attendence} / {item.totalClasses}</td>
                        <td style={{
                            fontSize: '1.1rem',
                            color: parseFloat(item.percentage) < 75 ? '#d32f2f' : '#388e3c',
                            fontWeight: 'bold',
                            borderRadius: '0 8px 8px 0'
                        }}>{item.percentage}%</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{padding: '20px', fontStyle: 'italic'}}>No attendance data found for Semester {semester}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  );
}

// --- STYLES ---

const headerContainerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  backgroundColor: '#f8f9fa', 
  margin: '30px 20px', 
  padding: '25px 30px', 
  borderRadius: '12px',
  flexWrap: 'wrap',
  gap: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const filterBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
};

const labelStyle = {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#555',
    marginLeft: '2px'
};

const inputStyle = { 
    padding: '10px 15px', // Increased Padding
    borderRadius: '6px', 
    border: '1px solid #ccc',
    fontSize: '1rem', // Increased Font Size
    minWidth: '150px' // Ensure decent width
};

const buttonStyle = {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 'bold',
    height: '42px', // Match height of inputs mostly
    marginTop: 'auto'
};

const cardContainerStyle = { 
  backgroundColor: '#f8f9fa', 
  margin: '30px auto', 
  borderRadius: '12px', 
  textAlign: 'center', 
  display: 'flex', 
  justifyContent: 'center', 
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};

export default StudentReport;