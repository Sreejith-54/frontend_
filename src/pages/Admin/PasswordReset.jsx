import React, { useState } from 'react'
import api from '../utils/api';

const PasswordReset = () => {
    const [email, setEmail]=useState('');
    const [password, setPassword]=useState('');
    const [pop, setPop] = useState(false);

    const confirm = (e) =>{
        e.preventDefault();
        setPop(true);
    }
    const handleSubmit = async(e) =>{
        try{
            await api.post('/api/admin/reset-password',{
                email: email,
                newPassword: password
            });
            alert("password changed successfully");
            setEmail("");
            setPassword("");
            setPop(false);
        }catch(err){
            console.error(err)
            alert("Failed to update Password");
        }
    }
  return (
    <div>
        {pop && 
      <div style={popupOverlayStyle}>
        <div style={popupContentStyle}>
          <div style={popupHeaderStyle}>
            <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '600' }}>Notice</h2>
          </div>
          <div className="popup">
            <h3>Are u sure?</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', padding: '0 24px 24px 24px' }}>
              <button style={popupCloseBtnStyle} onClick={() => setPop(false)}>Cancel</button>
              <button style={popupCloseBtnStyle} onClick={() => handleSubmit()}>Confirm</button>
          </div>
        </div>
      </div>
      }
        <div style={cardStyle}>
            <form
            onSubmit={confirm}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2vh',
              margin: '5vh auto',
              width: '80%',
            }}
          >
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="Enter email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

            <label>New Password</label>
            <input
              type="text"
              required
              placeholder="Enter New password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

            <button type="submit" style={btnStyle} >Submit
            </button>
          </form>
        </div>
    </div>
  )
}

export default PasswordReset

const cardStyle = {
  backgroundColor: "#f0f0f0",
  padding: "20px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "0.2s",
};

const btnStyle = {
    padding: "12px 25%",
    background: "#AD3A3C",
    color: "white",
    border: "none", 
    borderRadius: "4px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    margin: "auto",
    marginTop: "20px"
};
const popupOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
  flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const popupContentStyle = {
  backgroundColor: 'white', borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)', maxWidth: '400px',
  width: '90%', overflow: 'hidden'
};

const popupHeaderStyle = {
  backgroundColor: '#a33232', padding: '16px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
};

const popupCloseBtnStyle = {
  width: '100%', padding: '12px', backgroundColor: '#a33232',
  color: 'white', border: 'none', borderRadius: '6px',
  fontSize: '16px', fontWeight: '500', cursor: 'pointer'
};
