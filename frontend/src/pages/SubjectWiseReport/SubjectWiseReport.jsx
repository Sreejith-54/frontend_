import React, { useState } from "react";
import './subjectwisereport_style.css';

function SubjectWiseReport() {
  const [selectedClass, setSelectedClass] = useState("Class 1");
  const [selectedSubject, setSelectedSubject] = useState("");
  const subjects=["Operating System","DBMS","Optimization Techniques","Advanced Programming"]
  const classes=["Class1","Class2","Class3","Class4","OperatingSystem"]
  const reportData = [
    { id: 1, rollno: "CSE001", name: "Alice", attendance: "85%" },
    { id: 2, rollno: "CSE002", name: "Bob ", attendance: "72%" },
    { id: 3, rollno: "CSE003", name: "Priya", attendance: "90%" },
    { id: 4, rollno: "CSE004", name: "Rithu", attendance: "65%" },
  ];

  return (
    <div className='container'>
      <div className='operator' style={{display: 'flex', justifyContent: 'space-around', backgroundColor: '#f0f0f0', margin: '30px 20px', padding: '40px 20px', borderRadius: '8px'}}>
          <div className='class-selection'>
            <label htmlFor='class' style={{fontSize: '2vh', fontWeight: '600', marginRight: '10px'}}>Select Class: </label>
            <select id='class' name='class' style={{fontSize: '1.5vh', padding: '10px 5vw', }} value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map((className,index)=>(
              <option value={className} key={index}>{className}</option>
            ))}

            </select>
          </div>
           <div>
              <div style={{display: 'flex', alignItems: 'center'}}>
                    <label htmlFor='subject' style={{fontSize: '2vh', fontWeight: '600', marginRight: '1vw'}}>Select Subject: </label>
                    <select  style={{fontSize: '1.5vh', padding: '10px 5vw'}}
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  {
                    subjects.map((subject,index)=>{
                      return(
                        <option value={subject} key={index}>{subject}</option>
                      )
                    })
                  }
                </select>
              </div>
          </div>
        </div>

     

      <div className='main'>
        <div className='report'>
          <table className="report-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((student) => (
                <tr id={student.id} style={{backgroundColor: parseInt(student.attendance) < 75 ? '#ff8164' : parseInt(student.attendance) < 80 ? '#fdb469' : 'white'  }}>
                  <td style={{borderTopLeftRadius: '18px', borderBottomLeftRadius: '18px'}}>{student.rollno}</td>
                  <td>{student.name}</td>
                  <td>{student.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className='details'>
          <h3>Summary for {selectedClass}</h3>
          <p>Subject: {selectedSubject || "None Selected"}</p>
        </div>
      </div>
    </div>
  );
}

export default SubjectWiseReport;