import React, { useState } from "react";
import * as XLSX from "xlsx";

const TimeTableManagement = () => {
  const [data, setData] = useState([]);
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["9:00-9:50", "9:50-10:40", "10:50-11:40", "11:40-12:30", "12:30-1:20", "1:20-2:10","2:10-3:00","3:10-4:00"];
  const subjects = ["Maths","Physics","Chemistry","English","AI","DBMS","LB","Free"];

  function handleXL(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const buffer = new Uint8Array(event.target.result);

      // 1. Read workbook
      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      // 2. Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // 3. Convert sheet to rows
      let rows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      // 4. Fix merged/empty Day cells
      let lastDay = "";
      rows = rows.map((row) => {
        if (row.Day) {
          lastDay = row.Day;
        } else {
          row.Day = lastDay;
        }
        return row;
      });

        const normalized = {};

        rows.forEach((row) => {
        const day = row.Day;
        if (!day) return; 
        
        if (!normalized[day]) normalized[day] = {};

        Object.keys(row).forEach((key) => {
            if (key === "Day") return;
            normalized[day][key] = row[key];
        });
        });

        setData(normalized);
      console.log(normalized);
    };

    reader.readAsArrayBuffer(file);
  }

  function updatesub(day,slot,value){
    setData(prev => ({
        ...prev,
        [day]:{
            ...prev[day],
            [slot]:value
        }
    }));    
  }

  return (
    <div>
      <h2>Time Table Upload</h2>
      <br></br>
      <div>
        <div>
        <label>Select Class : </label>
        <select>
            <option>CSE A</option>
        </select>
        </div>
        <br></br>
        <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleXL(e.target.files[0])}
        />
        <hr></hr>
        <div style={{width: '75vw', overflowX:'scroll'}}>
            <table border={1} style={{marginTop: '40px', borderCollapse:'collapse' }}>
                <thead>
                    <th>Days</th>
                    {timeSlots.map((slot,id)=>(
                        <th key={id}>
                            {slot}
                        </th>
                    ))}
                </thead>
                <tbody>
                    {daysOfWeek.map((day)=>(
                        <tr key={day}>
                        <td>{day}</td>
                        {timeSlots.map((slot,id)=>(
                            <td key={slot} style={{height: '30px'}}>
                                <select key={id} value={data?.[day]?.[slot] || ""} onChange={(e)=>updatesub(day,slot,e.target.value)} style={{height: '30px', fontSize:'medium'}}>
                                    <option value=''>select</option>
                                    {subjects.map((sub)=>(
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </td>
                        ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
};

export default TimeTableManagement;
