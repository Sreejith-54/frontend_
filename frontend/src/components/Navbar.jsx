import React from 'react'
import logo from '../logo.png'
import { NavLink } from 'react-router-dom'
import "./Navbar.css"
import { useNavigate } from 'react-router-dom'

const Navbar = ({links}) => {
    const user = localStorage.getItem("user");
    const Navigate = useNavigate();
  return (
    <div>
        <header style={{ backgroundColor: '#AD3A3C' , color: 'white' , display: 'flex', justifyContent: 'space-between' }}>
            <div style={{display: 'flex', alignItems: 'center', paddingLeft: '30px', fontSize: '20px', fontWeight: 'bold'}}>
                <img src={logo} alt="Logo" style={{height: '10vh', marginRight: '10px',padding:'20px'}} />
            </div>
            <nav style={{display: 'flex',alignItems: 'center', gap: '2vw',color: 'white', paddingRight: '2vw',paddingLeft: '5vw'}}>
            {user === 'admin' &&
                <div style={{display:'flex',justifySelf:'flex-end',margin: '20px 40px'}}>
                <button onClick={()=>Navigate('/admin')} style={{padding: '10px 20px', fontSize:'medium', backgroundColor:'#AD3A3C',color:'white'}}>Admin functionalities</button>
                </div>
            }
            <ul>
                {links && links.map((item, index) => (
                    <li key={index} style={{listStyleType: 'none', display: 'inline', marginRight: '20px'}}>
                        <NavLink to={item.link} style={{color: 'white', textDecoration: 'none', fontSize: '2vh'}} >{item.name}</NavLink>
                    </li>
                ))}
            </ul>
            </nav>
        </header>
      </div>
  )
}

export default Navbar