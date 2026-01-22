import React from 'react'
import "./StudentReportComponent.css"

const StudentReportComponent = (props) => {
    const percent = props.totalClasses > 0 
      ? ((props.Attendence / props.totalClasses) * 100).toFixed(2)
      : 0;
    
    return (
      <tr 
        style={{
          backgroundColor: percent < 75 ? '#ff8164' : percent < 80 ? '#fdb469' : 'white'
        }}
      >
        <td style={{borderTopLeftRadius: '18px', borderBottomLeftRadius: '18px'}}>
          {props.courseID}
        </td>
        <td>{props.Subject}</td>
        <td>{props.Attendence}</td>
        <td>{props.totalClasses}</td>
        <td style={{borderTopRightRadius: '18px', borderBottomRightRadius: '18px'}}>
          {percent}%
        </td>
      </tr>
    )
}

export default StudentReportComponent;