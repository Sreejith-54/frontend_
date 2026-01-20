// import React from 'react'
// import { useState, useEffect } from "react";

// export default function FacultyCode() {
//   const [key, setKey] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchFacultyKey();
//   }, []);

//   const fetchFacultyKey = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/admin/faculty/key");

//       if (!res.data?.result?.authorization_key) {
//         throw new Error("Authorization key not found");
//       }

//       setKey(res.data.result.authorization_key);
//     } catch (err) {
//       console.error(err);
//       setError(
//         err.response?.data?.error || "Failed to fetch authorization key"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <p>Loading authorization key...</p>;
//   }

//   if (error) {
//     return <p style={{ color: "red" }}>{error}</p>;
//   }

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Faculty Authorization Key</h2>

//       <div
//         style={{
//           marginTop: "15px",
//           padding: "12px",
//           background: "#f4f4f4",
//           borderRadius: "6px",
//           fontFamily: "monospace",
//           fontSize: "16px",
//         }}
//       >
//         {key}
//       </div>
//     </div>
//   );
// }
// }
