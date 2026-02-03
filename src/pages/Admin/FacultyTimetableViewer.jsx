import { useState, useEffect,useRef } from "react";
import api from "../utils/api";

const FacultyTimetableViewer = () => {
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedSemester, setSelectedSemester] = useState("1"); // New State
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(false);
    const [facultySearch, setFacultySearch] = useState("");
    const [facultyOpen, setFacultyOpen] = useState(false);
    const facultyRef = useRef(null);

    // 1. Fetch Faculty List
    useEffect(() => {
        api.get("/admin/faculty")
            .then(res => setFacultyList(res.data))
            .catch(err => console.error("Error fetching faculty:", err));
    }, []);
    useEffect(() => {
        const close = (e) => {
            if (facultyRef.current && !facultyRef.current.contains(e.target)) setFacultyOpen(false);
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);


    // 2. Fetch Schedule
    useEffect(() => {
        if (!selectedFaculty) {
            setScheduleData({});
            return;
        }

        setLoading(true);
        // Pass the profile_id (selectedFaculty) to the backend
        api.get(`/faculty/my-schedule?faculty_id=${selectedFaculty}`)
            .then(res => {
                setScheduleData(res.data[0] || {});
            })
            .catch(err => {
                console.error(err);
                alert("Failed to fetch schedule");
            })
            .finally(() => setLoading(false));
    }, [selectedFaculty]);

    
    // --- HELPER: Find Slot Data ---
    const findSlotData = (day, slotNum) => {
        // scheduleData structure: { "CSE 2023 (A)": [ {day, slot, semester...} ] }

        for (const [className, slots] of Object.entries(scheduleData)) {
            // Find slot matching Day + Slot Number
            const found = slots.find(s => s.day === day && s.slot_number === slotNum);

            // Apply Semester Filter
            if (found) {
                if (selectedSemester !== "All" && found.semester.toString() !== selectedSemester) {
                    continue; // Skip if semester doesn't match
                }
                return { ...found, className };
            }
        }
        return null;
    };

    return (
        <div>
            {/* CONTROLS */}
            <div style={filterContainer}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={labelStyle}>Select Faculty:</label>
                    <div style={{ position: "relative" }} ref={facultyRef}>
                        <input
                            type="text"
                            value={facultySearch}
                            onChange={(e) => { setFacultySearch(e.target.value); setFacultyOpen(true); }}
                            onFocus={() => setFacultyOpen(true)}
                            placeholder={facultyList.find(f => f.profile_id == selectedFaculty) ? `${facultyList.find(f => f.profile_id == selectedFaculty).faculty_name} (${facultyList.find(f => f.profile_id == selectedFaculty).dept_code})` : "-- Choose Faculty --"}
                            style={selectStyle}
                        />
                        {facultyOpen && (
                            <ul style={dropdownListStyle}>
                                {facultyList
                                    .filter(f => `${f.faculty_name} (${f.dept_code})`.toLowerCase().includes(facultySearch.toLowerCase()))
                                    .map(f => (
                                        <li key={f.profile_id} style={dropdownItemStyle} onClick={() => { setSelectedFaculty(f.profile_id); setFacultySearch(""); setFacultyOpen(false); }}>
                                            {f.faculty_name} ({f.dept_code})
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={labelStyle}>Filter by Semester:</label>
                    <select
                        style={{ ...selectStyle, minWidth: '120px' }}
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <option key={s} value={s.toString()}>Sem {s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TIMETABLE GRID */}
            {loading ? <p style={{ marginTop: '20px', color: '#666' }}>Loading schedule...</p> : (
                selectedFaculty ? (
                    <div style={{ marginTop: "20px" }}>
                        <FacultyGridHelper findSlotData={findSlotData} />
                    </div>
                ) : (
                    <div style={emptyState}>
                        <p>Select a faculty member to view their classes.</p>
                    </div>
                )
            )}
        </div>
    );
};

// --- GRID UI ---
const FacultyGridHelper = ({ findSlotData }) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", border: "1px solid #ddd", background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <thead>
                <tr>
                    <th style={{ ...thStyle, width: '80px' }}>Day</th>
                    {slots.map(s => <th key={s} style={thStyle}>{s}</th>)}
                </tr>
            </thead>
            <tbody>
                {days.map(day => (
                    <tr key={day}>
                        <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8f9fa", borderRight: '2px solid #ddd', color: '#333' }}>
                            {day}
                        </td>
                        {slots.map(slot => {
                            const entry = findSlotData(day, slot);
                            return (
                                <td key={slot} style={entry ? activeTdStyle : tdStyle}>
                                    {entry ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                            {/* COURSE INFO */}
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#AD3A3C', marginBottom: '2px' }}>
                                                {entry.course_name}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                                                ({entry.course_code})
                                            </div>

                                            {/* CLASS INFO (The Class they are teaching) */}
                                            <div style={{
                                                background: '#e9ecef',
                                                padding: '3px',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                color: '#333'
                                            }}>
                                                {entry.className}
                                                <span style={{ marginLeft: '3px', color: '#AD3A3C' }}>
                                                    (Sem {entry.semester})
                                                </span>
                                            </div>

                                            {/* ROOM INFO */}
                                            {entry.room_info && (
                                                <div style={{ fontSize: '9px', color: '#888', marginTop: '3px' }}>
                                                    Room: {entry.room_info}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ color: '#f0f0f0', fontSize: '20px' }}>•</span>
                                    )}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// --- STYLES ---
const filterContainer = { display: "flex", gap: "20px", background: "#fff", padding: "15px 20px", borderRadius: "8px", borderBottom: "3px solid #AD3A3C", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", alignItems: 'flex-end' };
const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#777', textTransform: 'uppercase' };
const selectStyle = { padding: "8px 12px", borderRadius: "4px", border: "1px solid #ccc", minWidth: "220px", fontSize: '14px', background: '#fdfdfd' };
const emptyState = { textAlign: "center", padding: "60px", color: "#999", fontStyle: "italic", background: "#fff", border: "1px dashed #ddd", marginTop: "20px", borderRadius: '8px' };
const thStyle = { background: "#AD3A3C", color: "white", padding: "12px", border: "1px solid #e0e0e0", fontSize: "14px", fontWeight: '600' };
const tdStyle = { padding: "8px", border: "1px solid #eee", height: "90px", verticalAlign: "middle", width: "10%", fontSize: '13px' };
const activeTdStyle = { ...tdStyle, background: '#fff', border: '1px solid #ccc' };
const dropdownListStyle = { position: "absolute", width: "100%", background: "white", border: "1px solid #ccc", maxHeight: "200px", overflowY: "auto", zIndex: 100, listStyle: "none", padding: 0, margin: "4px 0 0", borderRadius: "4px" };
const dropdownItemStyle = { padding: "8px 12px", cursor: "pointer" };

export default FacultyTimetableViewer;