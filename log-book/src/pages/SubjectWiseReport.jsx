import React from "react";
import '../style.css'
import icon_img from'../assets/logbook.png';
import title from '../assets/title.png'

function SubjectWiseReport(){
return(
    <div className='container'>
      <div className='title-card'>
        <img src={icon_img} className='icon'></img>
        <img src={title} width={200} height={60}></img>
      </div>
      <div className='operator'>
       <label>Class:</label>
       <select>
        <option>Class 1</option>
        <option>Class 2</option>
        <option>Class 3</option>
       </select>
       <button className='student-btn'>STUDENT REPORT</button>
       <button className='class-btn'>CLASS REPORT</button>
      </div>
      <div className='subject'>
      <select>
        <option>Select Subject</option>
        <option>Subject 1</option>
        <option>Subject 2</option>
      </select>
      </div>
      <div className='main'>
        <div className='report'>
        <table>
          <tr>
            <th>Rollno</th>
            <th>Student name</th>
            <th>Attendance</th>
          </tr>
        </table>
        <div style={{display:'flex',backgroundColor:'white',border:'2px solid black',borderRadius:'10px',width:'80%',height:'15%',marginLeft:'20px'}}>
          <p>rollno</p>
          <p>Student name</p>
          <p>75%</p>
        </div>
                <div style={{display:'flex',backgroundColor:'white',border:'2px solid black',borderRadius:'10px',width:'80%',height:'15%',margin:'20px'}}>
          <p>rollno</p>
          <p>Student name</p>
          <p>75%</p>
        </div>
                <div style={{display:'flex',backgroundColor:'white',border:'2px solid black',borderRadius:'10px',width:'80%',height:'15%',margin:'20px'}}>
          <p>rollno</p>
          <p>Student name</p>
          <p>75%</p>
        </div>
        </div>
      <div className='details'>

      </div>
      </div>
    </div>
)
}
export default SubjectWiseReport;