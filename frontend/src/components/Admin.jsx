import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ListItemIcon,
  useMediaQuery,
  Chip,
  CircularProgress,
  Modal,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import MosqueIcon from "@mui/icons-material/Mosque";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/config";

const themeColors = {
  bg: "#0a1128",
  sidebar: "#0d1538",
  primary: "#FF3B30",
  hover: "#5393ff",
  text: "#e0e0e0",
  card: "#142136",
};

const adminMenu = [
  { name: "Dashboard", icon: <DashboardIcon /> },
  { name: "Slot Management", icon: <SettingsIcon /> },
  { 
    name: "Bookings", 
    icon: <ConfirmationNumberIcon />, 
    subItems: [
      { name: "Mosque", icon: <MosqueIcon /> },
      { name: "Evening", icon: <NightsStayIcon /> }
    ] 
  },
  { name: "Students", icon: <PeopleIcon /> },
  { 
    name: "Payments", 
    icon: <PaymentsIcon />,
    subItems: [
      { name: "Mosque", icon: <MosqueIcon /> },
      { name: "Evening", icon: <NightsStayIcon /> }
    ]
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const isMobile = useMediaQuery("(max-width:900px)");
  const [bookings, setBookings] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalPayments, setTotalPayments] = useState(0);
  const [todayStats, setTodayStats] = useState({ mBks: 0, mRev: 0, eBks: 0, eRev: 0 });
  const [mosqueStats, setMosqueStats] = useState({ bookings: 0, revenue: 0 });
  const [eveningStats, setEveningStats] = useState({ bookings: 0, revenue: 0 });
  const [dailySummary, setDailySummary] = useState([]);
  const [isResetting, setIsResetting] = useState(false); // New state for reset button loading
  const [loading, setLoading] = useState(true);
  const [screenshotModal, setScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [viewedScreenshots, setViewedScreenshots] = useState(new Set()); // Track viewed screenshots
  const [mosqueSlots, setMosqueSlots] = useState(4); // Default 4 slots for mosque
  const [eveningSlots, setEveningSlots] = useState(4); // Default 4 slots for evening
  const [selectedSlotDate, setSelectedSlotDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [slotsDatabase, setSlotsDatabase] = useState({}); // Store slots for each date
  const [classes, setClasses] = useState([]); // Store all classes
  const [filterId, setFilterId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStudentName, setFilterStudentName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [newClassName, setNewClassName] = useState(""); // New class input field
  const [addingClass, setAddingClass] = useState(false); // Loading state for adding class

  
  const todayStr = new Date().toLocaleDateString('en-CA');

  // Load slots for selected date or use defaults
  const loadSlotsForDate = (date) => {
    setSelectedSlotDate(date);
    if (slotsDatabase[date]) {
      setMosqueSlots(slotsDatabase[date].mosque);
      setEveningSlots(slotsDatabase[date].evening);
    } else {
      setMosqueSlots(4);
      setEveningSlots(4);
    }
  };

  // Save slots for the selected date
  const saveSlotsForDate = (date, mosque, evening) => {
    setSlotsDatabase(prev => ({
      ...prev,
      [date]: { mosque, evening }
    }));
    // In production, you would save this to backend
    // For now, it's stored in state/localStorage
    localStorage.setItem(`slots_${date}`, JSON.stringify({ mosque, evening }));
  };

  // Update mosque slots and save
  const updateMosqueSlots = (newValue) => {
    setMosqueSlots(newValue);
    saveSlotsForDate(selectedSlotDate, newValue, eveningSlots);
  };

  // Update evening slots and save
  const updateEveningSlots = (newValue) => {
    setEveningSlots(newValue);
    saveSlotsForDate(selectedSlotDate, mosqueSlots, newValue);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, summaryRes, classesRes] = await Promise.all([
        fetch(`${API_BASE}/bookings`),
        fetch(`${API_BASE}/bookings/daily-summary`),
        fetch(`${API_BASE}/classes`)
      ]);

      if (!bookingsRes.ok || !summaryRes.ok || !classesRes.ok) throw new Error("Failed to fetch data");

      const bookingsData = await bookingsRes.json();
      const summaryData = await summaryRes.json();
      const classesData = await classesRes.json();

      setBookings(bookingsData);
      setDailySummary(summaryData);
      setClasses(classesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openScreenshotModal = (screenshot, bookingId) => {
    setSelectedScreenshot(screenshot);
    setSelectedBookingId(bookingId);
    setScreenshotModal(true);
    // Mark this screenshot as viewed
    setViewedScreenshots(prev => new Set(prev).add(bookingId));
  };

  const closeScreenshotModal = () => {
    setScreenshotModal(false);
    setSelectedScreenshot(null);
    setSelectedBookingId(null);
  };

  const handleConfirm = async (id, booking) => {
    try {
      // Check if screenshot exists
      if (!booking.paymentScreenshot) {
        alert("⚠️ No payment screenshot uploaded! Please ask the user to upload a screenshot before confirming.");
        return;
      }

      // Check if admin has viewed the screenshot
      if (!viewedScreenshots.has(id)) {
        alert("⚠️ You must view the payment screenshot before confirming! Click the 'View' button to verify the payment.");
        return;
      }

      // Confirm the booking
      const res = await fetch(`${API_BASE}/bookings/${id}/confirm`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm booking");
      
      // Clear the viewed status after confirmation
      setViewedScreenshots(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
      
      alert("✓ Payment confirmed successfully!");
      fetchData(); // Refresh data after confirmation
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete booking");
      
      fetchData(); // Refresh data after deletion
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("WARNING: This will delete ALL bookings and payment data. This action cannot be undone. Proceed?")) return;
    setIsResetting(true); // Set loading state
    try {
      const res = await fetch(`${API_BASE}/bookings/reset`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset data");
      
      // Clear local state immediately
      setBookings([]);
      setDailySummary([]);
      alert("All data has been cleared.");
      fetchData();
    } catch (err) {
      console.error("Reset Error:", err); // More specific console log
      alert(err.message);
    } finally {
      setIsResetting(false); // Reset loading state
    }
  };

  useEffect(() => {
    fetchData();
    // Load slots from localStorage for all dates
    const allSlots = {};
    for (let key in localStorage) {
      if (key.startsWith('slots_')) {
        const date = key.replace('slots_', '');
        allSlots[date] = JSON.parse(localStorage[key]);
      }
    }
    setSlotsDatabase(allSlots);
    
    // Load today's slots
    const todaySlots = localStorage.getItem(`slots_${todayStr}`);
    if (todaySlots) {
      const parsed = JSON.parse(todaySlots);
      setMosqueSlots(parsed.mosque);
      setEveningSlots(parsed.evening);
    }
    setSelectedSlotDate(todayStr);
  }, []);

  useEffect(() => {
    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed"
    );

    const students = confirmedBookings.reduce(
      (acc, booking) => acc + booking.passengers,
      0
    );
    setTotalStudents(students);

    const mConfirmed = confirmedBookings.filter(b => b.search.toLowerCase().includes("mosque"));
    const eConfirmed = confirmedBookings.filter(b => b.search.toLowerCase().includes("evening"));

    const mRev = mConfirmed.reduce((acc, b) => acc + b.passengers * 30, 0);
    const eRev = eConfirmed.reduce((acc, b) => acc + b.passengers * 20, 0);

    setMosqueStats({ bookings: mConfirmed.length, revenue: mRev });
    setEveningStats({ bookings: eConfirmed.length, revenue: eRev });
    setTotalPayments(mRev + eRev);

    const todayConfirmed = confirmedBookings.filter(b => b.date === todayStr);
    const tmConfirmed = todayConfirmed.filter(b => b.search.toLowerCase().includes("mosque"));
    const teConfirmed = todayConfirmed.filter(b => b.search.toLowerCase().includes("evening"));
    setTodayStats({
      mBks: tmConfirmed.length,
      mRev: tmConfirmed.reduce((acc, b) => acc + b.passengers * 30, 0),
      eBks: teConfirmed.length,
      eRev: teConfirmed.reduce((acc, b) => acc + b.passengers * 20, 0)
    });
  }, [bookings]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: themeColors.bg }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            background: themeColors.sidebar,
            color: themeColors.text,
            borderRight: "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          },
        }}
      >
        {/* Menu Items */}
        <Box>
          <Box sx={{ px: 3, pt: 3, pb: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="CBBS Logo"
              sx={{ height: 60, width: "auto", borderRadius: 2 }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", color: themeColors.primary }}>
              Admin Panel
            </Typography>
          </Box>
          <List>
            {adminMenu.map((item) => (
              <React.Fragment key={item.name}>
                <ListItem disablePadding>
                  <ListItemButton
                    sx={{
                      color: themeColors.text,
                      mb: 0.5,
                      borderRadius: 1,
                      "&.Mui-selected": { backgroundColor: themeColors.primary, color: "#fff" },
                    }}
                    selected={activeMenu === item.name && !activeSubMenu}
                    onClick={() => {
                      setActiveMenu(item.name);
                      setActiveSubMenu(null);
                      if (isMobile) setDrawerOpen(false);
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.name} />
                  </ListItemButton>
                </ListItem>
                {item.subItems && (
                  <List component="div" disablePadding>
                    {item.subItems.map((sub) => (
                      <ListItemButton
                        key={sub.name}
                        sx={{
                          pl: 4,
                          color: themeColors.text,
                          mb: 0.5,
                          borderRadius: 1,
                          "&.Mui-selected": { backgroundColor: themeColors.primary, color: "#fff" },
                        }}
                        selected={activeSubMenu === sub.name}
                        onClick={() => {
                          setActiveMenu(item.name);
                          setActiveSubMenu(sub.name);
                          if (isMobile) setDrawerOpen(false);
                        }}
                      >
                        <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{sub.icon}</ListItemIcon>
                        <ListItemText primary={sub.name} />
                      </ListItemButton>
                    ))}
                  </List>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Bottom Buttons */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            sx={{ mb: 1, fontWeight: "bold" }}
            disabled={isResetting} // Disable button while resetting
            onClick={handleReset}
          >
            {isResetting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Reset All Data"}
          </Button>
          <Button
            startIcon={<HomeIcon />}
            fullWidth
            sx={{
              color: themeColors.text,
              mb: 1,
              background: themeColors.card,
              "&:hover": { background: themeColors.primary, color: "#fff" },
            }}
            onClick={() => navigate("/h")}
          >
            Home
          </Button>
          <Button
            startIcon={<LogoutIcon />}
            fullWidth
            sx={{
              color: themeColors.text,
              background: themeColors.card,
              "&:hover": { background: themeColors.primary, color: "#fff" },
            }}
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        {/* Mobile AppBar */}
        {isMobile && (
          <AppBar position="fixed" sx={{ background: themeColors.sidebar }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 2 }}>
                Admin Panel
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ mt: isMobile ? 8 : 0 }}>
          <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
            {activeSubMenu ? `${activeMenu} » ${activeSubMenu}` : activeMenu}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              sx={{ background: themeColors.primary, '&:hover': { background: themeColors.hover } }}
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Refresh Data"}
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
              <CircularProgress sx={{ color: themeColors.primary }} />
            </Box>
          ) : (
            <>
          {/* Dashboard Cards */}
          {activeMenu === "Dashboard" && (
            <>
            <Typography variant="h5" sx={{ color: themeColors.primary, mb: 2 }}>Today's Summary</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
              <Paper sx={{ flex: "1 1 200px", p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Today's Mosque Bks</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>{todayStats.mBks}</Typography>
                  </Box>
                  <MosqueIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
              <Paper sx={{ flex: "1 1 200px", p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Today's Evening Bks</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>{todayStats.eBks}</Typography>
                  </Box>
                  <NightsStayIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
              <Paper sx={{ flex: "1 1 200px", p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Today's Mosque Rev</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>₹{todayStats.mRev}</Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
              <Paper sx={{ flex: "1 1 200px", p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Today's Evening Rev</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>₹{todayStats.eRev}</Typography>
                  </Box>
                  <TrendingUpIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
            </Box>

            <Typography variant="h5" sx={{ color: themeColors.primary, mb: 2 }}>Overall Statistics</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
              <Paper
                sx={{
                  flex: "1 1 200px",
                  p: 3,
                  background: themeColors.card,
                  color: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Mosque (Confirmed)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>
                      {mosqueStats.bookings}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
              <Paper
                sx={{
                  flex: "1 1 200px",
                  p: 3,
                  background: themeColors.card,
                  color: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Evening (Confirmed)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>
                      {eveningStats.bookings}
                    </Typography>
                  </Box>
                  <AssessmentIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
              <Paper
                sx={{
                  flex: "1 1 200px",
                  p: 3,
                  background: themeColors.card,
                  color: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Mosque Revenue</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>
                      ₹{mosqueStats.revenue}
                    </Typography>
                  </Box>
                  <PaymentsIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
              <Paper
                sx={{
                  flex: "1 1 200px",
                  p: 3,
                  background: themeColors.card,
                  color: "#fff",
                  borderRadius: 2,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>Evening Revenue</Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>
                      ₹{eveningStats.revenue}
                    </Typography>
                  </Box>
                  <PaymentsIcon sx={{ color: themeColors.primary, opacity: 0.5 }} />
                </Box>
              </Paper>
            </Box>
            </>
          )}

          {/* Slot Management Section */}
          {activeMenu === "Slot Management" && (
            <>
            <Typography variant="h5" sx={{ color: themeColors.primary, mb: 2 }}>Slot Management</Typography>
            
            {/* Date Picker for Slots */}
            <Box sx={{ mb: 4, p: 2, background: themeColors.card, borderRadius: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayIcon sx={{ color: themeColors.primary }} />
                <Typography sx={{ fontWeight: "bold", color: "#fff" }}>Select Date:</Typography>
              </Box>
              <input
                type="date"
                value={selectedSlotDate}
                onChange={(e) => loadSlotsForDate(e.target.value)}
                min={new Date().toLocaleDateString('en-CA')}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: `1px solid ${themeColors.primary}`,
                  background: "#1a1a2e",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              />
              <Typography sx={{ fontWeight: "bold", color: themeColors.primary, marginLeft: "auto" }}>
                {selectedSlotDate === todayStr ? "📍 Today" : ""}
              </Typography>
            </Box>

            {/* Slot Controls */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
              {/* Mosque Slots */}
              <Paper sx={{ flex: "1 1 250px", p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <MosqueIcon sx={{ color: themeColors.primary }} />
                  <Typography sx={{ fontWeight: "bold" }}>Mosque Slots</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => updateMosqueSlots(Math.max(1, mosqueSlots - 1))}
                    sx={{ background: themeColors.primary, minWidth: "45px", p: 1 }}
                  >
                    −
                  </Button>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: themeColors.primary, minWidth: "50px", textAlign: "center" }}>
                    {mosqueSlots}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => updateMosqueSlots(Math.min(16, mosqueSlots + 1))}
                    sx={{ background: themeColors.primary, minWidth: "45px", p: 1 }}
                  >
                    +
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: "#aaa", display: "block", textAlign: "center", mb: 2 }}>
                  Max: 16 slots
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    saveSlotsForDate(selectedSlotDate, mosqueSlots, eveningSlots);
                    alert(`✓ Mosque slots updated to ${mosqueSlots} for ${selectedSlotDate}`);
                  }}
                  sx={{
                    background: "#4caf50",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": { background: "#66bb6a" },
                  }}
                >
                  ✓ Apply
                </Button>
              </Paper>

              {/* Evening Slots */}
              <Paper sx={{ flex: "1 1 250px", p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <NightsStayIcon sx={{ color: themeColors.primary }} />
                  <Typography sx={{ fontWeight: "bold" }}>Evening Slots</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => updateEveningSlots(Math.max(1, eveningSlots - 1))}
                    sx={{ background: themeColors.primary, minWidth: "45px", p: 1 }}
                  >
                    −
                  </Button>
                  <Typography variant="h4" sx={{ fontWeight: "bold", color: themeColors.primary, minWidth: "50px", textAlign: "center" }}>
                    {eveningSlots}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => updateEveningSlots(Math.min(16, eveningSlots + 1))}
                    sx={{ background: themeColors.primary, minWidth: "45px", p: 1 }}
                  >
                    +
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: "#aaa", display: "block", textAlign: "center", mb: 2 }}>
                  Max: 16 slots
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    saveSlotsForDate(selectedSlotDate, mosqueSlots, eveningSlots);
                    alert(`✓ Evening slots updated to ${eveningSlots} for ${selectedSlotDate}`);
                  }}
                  sx={{
                    background: "#4caf50",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": { background: "#66bb6a" },
                  }}
                >
                  ✓ Apply
                </Button>
              </Paper>
            </Box>
            </>
          )}

          {/* Tables for other menus */}
          {activeMenu === "Bookings" && !activeSubMenu && (
            <>
            <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Today's Mosque Bookings</Typography>
            <TableContainer component={Paper} sx={{ background: themeColors.card, mb: 4 }}>
              <Table>
                <TableHead sx={{ background: themeColors.sidebar }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Slot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Passengers</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.filter(b => b.date === todayStr && b.search.toLowerCase().includes("mosque") && b.status === "confirmed").map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                      <TableCell><Chip label={booking.status} color="success" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Today's Evening Bookings</Typography>
            <TableContainer component={Paper} sx={{ background: themeColors.card, mb: 4 }}>
              <Table>
                <TableHead sx={{ background: themeColors.sidebar }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Slot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Passengers</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.filter(b => b.date === todayStr && b.search.toLowerCase().includes("evening") && b.status === "confirmed").map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                      <TableCell><Chip label={booking.status} color="success" size="small" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}

          {activeMenu === "Bookings" && activeSubMenu === "Mosque" && (
            <>
            <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Mosque Bookings</Typography>
            
            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                size="small"
                label="Search ID"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                sx={{ 
                  background: themeColors.card, 
                  input: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  "& .MuiOutlinedInput-root": { 
                    "& fieldset": { borderColor: "#555" } 
                  } 
                }}
              />
              <TextField
                size="small"
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                sx={{ 
                  background: themeColors.card, 
                  input: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  "& .MuiOutlinedInput-root": { 
                    "& fieldset": { borderColor: "#555" } 
                  } 
                }}
              />
              <TextField
                select
                size="small"
                label=""
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ 
                  background: themeColors.card, 
                  select: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  minWidth: 150, 
                  "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } 
                }}
              >
                <option value="" style={{ color: "black" }}>All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.name} style={{ color: "black" }}>{cls.name}</option>
                ))}
              </TextField>
              <Button 
                variant="outlined" 
                onClick={() => { setFilterId(""); setFilterDate(""); setFilterClass(""); }}
                sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
              >
                Clear
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ background: themeColors.card }}>
              <Table>
                <TableHead sx={{ background: themeColors.sidebar }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Slot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Passengers</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Payment Screenshot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.filter(b => {
                    const matchesCategory = b.search.toLowerCase().includes("mosque");
                    const matchesId = filterId ? b._id.toLowerCase().includes(filterId.toLowerCase()) : true;
                    const matchesDate = filterDate ? b.date === filterDate : true;
                    const matchesClass = filterClass ? b.className === filterClass : true;
                    return matchesCategory && matchesId && matchesDate && matchesClass;
                  }).map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell sx={{ color: "#fff" }}>{booking._id}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.date}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.className || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={booking.status === 'confirmed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {booking.paymentScreenshot ? (
                          <Button
                            size="small"
                            variant={viewedScreenshots.has(booking._id) ? "contained" : "outlined"}
                            sx={{ 
                              color: viewedScreenshots.has(booking._id) ? "#fff" : themeColors.primary, 
                              background: viewedScreenshots.has(booking._id) ? themeColors.primary : "transparent",
                              borderColor: themeColors.primary,
                              fontWeight: viewedScreenshots.has(booking._id) ? "bold" : "normal"
                            }}
                            onClick={() => openScreenshotModal(booking.paymentScreenshot, booking._id)}
                          >
                            {viewedScreenshots.has(booking._id) ? "✓ Viewed" : "View"}
                          </Button>
                        ) : (
                          <Typography sx={{ color: "#f44336", fontSize: "0.85rem", fontWeight: "bold" }}>
                            ⚠️ No screenshot
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.status !== "confirmed" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            sx={{ 
                              mr: 1,
                              opacity: !viewedScreenshots.has(booking._id) ? 0.5 : 1,
                              cursor: !viewedScreenshots.has(booking._id) ? "not-allowed" : "pointer"
                            }}
                            disabled={!booking.paymentScreenshot || !viewedScreenshots.has(booking._id)}
                            onClick={() => handleConfirm(booking._id, booking)}
                          >
                            Confirm
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDelete(booking._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}

          {activeMenu === "Bookings" && activeSubMenu === "Evening" && ( // Full Evening History
            <>
            <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>All Evening Bookings</Typography>
            
            {/* Filters */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                size="small"
                label="Search ID"
                value={filterId}
                onChange={(e) => setFilterId(e.target.value)}
                sx={{ 
                  background: themeColors.card, 
                  input: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  "& .MuiOutlinedInput-root": { 
                    "& fieldset": { borderColor: "#555" } 
                  } 
                }}
              />
              <TextField
                size="small"
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                sx={{ 
                  background: themeColors.card, 
                  input: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  "& .MuiOutlinedInput-root": { 
                    "& fieldset": { borderColor: "#555" } 
                  } 
                }}
              />
              <TextField
                select
                size="small"
                label=""
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ 
                  background: themeColors.card, 
                  select: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  minWidth: 150, 
                  "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } 
                }}
              >
                <option value="" style={{ color: "black" }}>All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.name} style={{ color: "black" }}>{cls.name}</option>
                ))}
              </TextField>
              <Button 
                variant="outlined" 
                onClick={() => { setFilterId(""); setFilterDate(""); setFilterClass(""); }}
                sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
              >
                Clear
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ background: themeColors.card }}>
              <Table>
                <TableHead sx={{ background: themeColors.sidebar }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Slot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Passengers</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Payment Screenshot</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.filter(b => {
                    const matchesCategory = b.search.toLowerCase().includes("evening");
                    const matchesId = filterId ? b._id.toLowerCase().includes(filterId.toLowerCase()) : true;
                    const matchesDate = filterDate ? b.date === filterDate : true;
                    const matchesClass = filterClass ? b.className === filterClass : true;
                    return matchesCategory && matchesId && matchesDate && matchesClass;
                  }).map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell sx={{ color: "#fff" }}>{booking._id}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.date}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                      <TableCell sx={{ color: "#fff" }}>{booking.className || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={booking.status === 'confirmed' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {booking.paymentScreenshot ? (
                          <Button
                            size="small"
                            variant={viewedScreenshots.has(booking._id) ? "contained" : "outlined"}
                            sx={{ 
                              color: viewedScreenshots.has(booking._id) ? "#fff" : themeColors.primary, 
                              background: viewedScreenshots.has(booking._id) ? themeColors.primary : "transparent",
                              borderColor: themeColors.primary,
                              fontWeight: viewedScreenshots.has(booking._id) ? "bold" : "normal"
                            }}
                            onClick={() => openScreenshotModal(booking.paymentScreenshot, booking._id)}
                          >
                            {viewedScreenshots.has(booking._id) ? "✓ Viewed" : "View"}
                          </Button>
                        ) : (
                          <Typography sx={{ color: "#f44336", fontSize: "0.85rem", fontWeight: "bold" }}>
                            ⚠️ No screenshot
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {booking.status !== "confirmed" && (
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="success" 
                            sx={{ 
                              mr: 1,
                              opacity: !viewedScreenshots.has(booking._id) ? 0.5 : 1,
                              cursor: !viewedScreenshots.has(booking._id) ? "not-allowed" : "pointer"
                            }}
                            disabled={!booking.paymentScreenshot || !viewedScreenshots.has(booking._id)}
                            onClick={() => handleConfirm(booking._id, booking)}
                          >
                            Confirm
                          </Button>
                        )}
                        <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(booking._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
          )}

          {activeMenu === "Students" && (
            <>
              <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Confirmed Students List</Typography>
              
              {/* Filters */}
              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  label="Search Student Name"
                  value={filterStudentName}
                  onChange={(e) => setFilterStudentName(e.target.value)}
                  sx={{ background: themeColors.card, input: { color: "#fff" }, label: { color: "#fff" }, minWidth: 200, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } }}
                />
                <TextField
                  select
                  size="small"
                  label=""
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ background: themeColors.card, select: { color: "#fff" }, label: { color: "#fff" }, minWidth: 150, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } }}
                >
                  <option value="" style={{ color: "black" }}>Categories</option>
                  <option value="mosque" style={{ color: "black" }}>Mosque</option>
                  <option value="evening" style={{ color: "black" }}>Evening</option>
                </TextField>
                <TextField
                  size="small"
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  sx={{ background: themeColors.card, input: { color: "#fff" }, label: { color: "#fff" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } }}
                />
                <TextField
                  select
                  size="small"
                  label=""
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ background: themeColors.card, select: { color: "#fff" }, label: { color: "#fff" }, minWidth: 150, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } }}
                >
                  <option value="" style={{ color: "black" }}>Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name} style={{ color: "black" }}>{cls.name}</option>
                  ))}
                </TextField>
                <Button 
                  variant="outlined" 
                  onClick={() => { setFilterCategory(""); setFilterDate(""); setFilterClass(""); setFilterStudentName(""); }}
                  sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
                >
                  Clear
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ background: themeColors.card }}>
                <Table>
                  <TableHead sx={{ background: themeColors.sidebar }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Student Name</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Route</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Confirmed Seats</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings
                      .filter((b) => {
                        const isConfirmed = b.status === "confirmed";
                        const matchesCategory = filterCategory ? b.search.toLowerCase().includes(filterCategory.toLowerCase()) : true;
                        const matchesDate = filterDate ? b.date === filterDate : true;
                        const matchesClass = filterClass ? b.className === filterClass : true;
                        const matchesName = filterStudentName ? (b.fullName && b.fullName.toLowerCase().includes(filterStudentName.toLowerCase())) : true;
                        return isConfirmed && matchesCategory && matchesDate && matchesClass && matchesName;
                      })
                      .map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell sx={{ color: "#fff" }}>{booking.fullName || "-"}</TableCell>
                          <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                          <TableCell sx={{ color: "#fff" }}>{booking.date}</TableCell>
                          <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                          <TableCell sx={{ color: "#fff" }}>{booking.className || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {activeMenu === "Payments" && (
            <Box> {/* This Box wraps all Payments content */}
            {!activeSubMenu && ( // Daily Summary
              <> {/* This Fragment wraps the Daily Summary content */}
            <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Today's Revenue Breakdown</Typography>
            <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
              <Paper sx={{ flex: 1, p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Today's Mosque Revenue</Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>₹{todayStats.mRev}</Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Today's Evening Revenue</Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>₹{todayStats.eRev}</Typography>
              </Paper>
              <Paper sx={{ flex: 1, p: 3, background: themeColors.card, color: "#fff", borderRadius: 2 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Total Today</Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: themeColors.primary }}>₹{todayStats.mRev + todayStats.eRev}</Typography>
              </Paper>
            </Box>

            <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Daily Summary</Typography>
            
            {/* Filters for Daily Summary */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              <TextField
                select
                size="small"
                label="Category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                SelectProps={{ native: true }}
                sx={{ 
                  background: themeColors.card, 
                  select: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  minWidth: 150, 
                  "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } 
                }}
              >
                <option value="" style={{ color: "black" }}>All Categories</option>
                <option value="mosque" style={{ color: "black" }}>Mosque</option>
                <option value="evening" style={{ color: "black" }}>Evening</option>
              </TextField>
              <TextField
                size="small"
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                sx={{ 
                  background: themeColors.card, 
                  input: { color: "#fff" }, 
                  label: { color: "#fff" }, 
                  "& .MuiOutlinedInput-root": { 
                    "& fieldset": { borderColor: "#555" } 
                  } 
                }}
              />
              <Button 
                variant="outlined" 
                onClick={() => { setFilterCategory(""); setFilterDate(""); }}
                sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
              >
                Clear
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ background: themeColors.card }}>
              <Table>
                <TableHead sx={{ background: themeColors.sidebar }}>
                  <TableRow>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Mosque (Bks/Rev)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Evening (Bks/Rev)</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailySummary
                    .filter(day => filterDate ? day._id === filterDate : true)
                    .map((day) => {
                    const mData = day.details.filter(d => d.search.toLowerCase().includes("mosque") && d.status === "confirmed");
                    const eData = day.details.filter(d => d.search.toLowerCase().includes("evening") && d.status === "confirmed");

                    const mRev = mData.reduce((acc, d) => acc + d.passengers * 30, 0);
                    const eRev = eData.reduce((acc, d) => acc + d.passengers * 20, 0);

                    // Apply category filter to the summary row
                    if (filterCategory === "mosque" && mRev === 0 && mData.length === 0) return null;
                    if (filterCategory === "evening" && eRev === 0 && eData.length === 0) return null;

                    return (
                      <TableRow key={day._id}>
                        <TableCell sx={{ color: "#fff" }}>{day._id}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{filterCategory === "evening" ? "-" : `${mData.length} / ₹${mRev}`}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{filterCategory === "mosque" ? "-" : `${eData.length} / ₹${eRev}`}</TableCell>
                        <TableCell sx={{ color: themeColors.primary, fontWeight: "bold" }}>
                          ₹{(filterCategory === "mosque" ? mRev : (filterCategory === "evening" ? eRev : mRev + eRev))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            </>
            )}

            {activeSubMenu === "Mosque" && (
              <>
              <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Mosque Payments</Typography>
              
              {/* Filters */}
              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  label="Search ID"
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  sx={{ 
                    background: themeColors.card, 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" }, 
                    "& .MuiOutlinedInput-root": { 
                      "& fieldset": { borderColor: "#555" } 
                    } 
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  sx={{ 
                    background: themeColors.card, 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" }, 
                    "& .MuiOutlinedInput-root": { 
                      "& fieldset": { borderColor: "#555" } 
                    } 
                  }}
                />
                <TextField
                  select
                  size="small"
                  label=""
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ 
                    background: themeColors.card, 
                    select: { color: "#fff" }, 
                    label: { color: "#fff" }, 
                    minWidth: 150, 
                    "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } 
                  }}
                >
                  <option value="" style={{ color: "black" }}>All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name} style={{ color: "black" }}>{cls.name}</option>
                  ))}
                </TextField>
                <Button 
                  variant="outlined" 
                  onClick={() => { setFilterId(""); setFilterDate(""); setFilterClass(""); }}
                  sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
                >
                  Clear
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ background: themeColors.card }}>
                <Table>
                  <TableHead sx={{ background: themeColors.sidebar }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Slot</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Passengers</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Payment Screenshot</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.filter(b => {
                      const matchesCategory = b.search.toLowerCase().includes("mosque");
                      const matchesId = filterId ? b._id.toLowerCase().includes(filterId.toLowerCase()) : true;
                      const matchesDate = filterDate ? b.date === filterDate : true;
                      const matchesClass = filterClass ? b.className === filterClass : true;
                      return matchesCategory && matchesId && matchesDate && matchesClass;
                    }).map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell sx={{ color: "#fff" }}>{booking._id}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.date}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.className || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={booking.status === 'confirmed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {booking.paymentScreenshot ? (
                            <Button
                              size="small"
                              variant={viewedScreenshots.has(booking._id) ? "contained" : "outlined"}
                              sx={{ 
                                color: viewedScreenshots.has(booking._id) ? "#fff" : themeColors.primary, 
                                background: viewedScreenshots.has(booking._id) ? themeColors.primary : "transparent",
                                borderColor: themeColors.primary,
                                fontWeight: viewedScreenshots.has(booking._id) ? "bold" : "normal"
                              }}
                              onClick={() => openScreenshotModal(booking.paymentScreenshot, booking._id)}
                            >
                              {viewedScreenshots.has(booking._id) ? "✓ Viewed" : "View"}
                            </Button>
                          ) : (
                            <Typography sx={{ color: "#f44336", fontSize: "0.85rem", fontWeight: "bold" }}>
                              ⚠️ No screenshot
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.status !== "confirmed" && (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              sx={{ 
                                mr: 1,
                                opacity: !viewedScreenshots.has(booking._id) ? 0.5 : 1,
                                cursor: !viewedScreenshots.has(booking._id) ? "not-allowed" : "pointer"
                              }}
                              disabled={!booking.paymentScreenshot || !viewedScreenshots.has(booking._id)}
                              onClick={() => handleConfirm(booking._id, booking)}
                            >
                              Confirm
                            </Button>
                          )}
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(booking._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </>
            )}

            {activeSubMenu === "Evening" && (
              <>
              <Typography variant="h6" sx={{ color: themeColors.primary, mb: 2 }}>Evening Payments</Typography>
              
              {/* Filters */}
              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  label="Search ID"
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  sx={{ 
                    background: themeColors.card, 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" }, 
                    "& .MuiOutlinedInput-root": { 
                      "& fieldset": { borderColor: "#555" } 
                    } 
                  }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  sx={{ 
                    background: themeColors.card, 
                    input: { color: "#fff" }, 
                    label: { color: "#fff" }, 
                    "& .MuiOutlinedInput-root": { 
                      "& fieldset": { borderColor: "#555" } 
                    } 
                  }}
                />
                <TextField
                  select
                  size="small"
                  label=""
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ 
                    background: themeColors.card, 
                    select: { color: "#fff" }, 
                    label: { color: "#fff" }, 
                    minWidth: 150, 
                    "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "#555" } } 
                  }}
                >
                  <option value="" style={{ color: "black" }}>All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls.name} style={{ color: "black" }}>{cls.name}</option>
                  ))}
                </TextField>
                <Button 
                  variant="outlined" 
                  onClick={() => { setFilterId(""); setFilterDate(""); setFilterClass(""); }}
                  sx={{ color: themeColors.primary, borderColor: themeColors.primary }}
                >
                  Clear
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ background: themeColors.card }}>
                <Table>
                  <TableHead sx={{ background: themeColors.sidebar }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Slot</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Passengers</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Class</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Payment Screenshot</TableCell>
                      <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.filter(b => {
                      const matchesCategory = b.search.toLowerCase().includes("evening");
                      const matchesId = filterId ? b._id.toLowerCase().includes(filterId.toLowerCase()) : true;
                      const matchesDate = filterDate ? b.date === filterDate : true;
                      const matchesClass = filterClass ? b.className === filterClass : true;
                      return matchesCategory && matchesId && matchesDate && matchesClass;
                    }).map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell sx={{ color: "#fff" }}>{booking._id}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.search}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.date}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.passengers}</TableCell>
                        <TableCell sx={{ color: "#fff" }}>{booking.className || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={booking.status === 'confirmed' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {booking.paymentScreenshot ? (
                            <Button
                              size="small"
                              variant={viewedScreenshots.has(booking._id) ? "contained" : "outlined"}
                              sx={{ 
                                color: viewedScreenshots.has(booking._id) ? "#fff" : themeColors.primary, 
                                background: viewedScreenshots.has(booking._id) ? themeColors.primary : "transparent",
                                borderColor: themeColors.primary,
                                fontWeight: viewedScreenshots.has(booking._id) ? "bold" : "normal"
                              }}
                              onClick={() => openScreenshotModal(booking.paymentScreenshot, booking._id)}
                            >
                              {viewedScreenshots.has(booking._id) ? "✓ Viewed" : "View"}
                            </Button>
                          ) : (
                            <Typography sx={{ color: "#f44336", fontSize: "0.85rem", fontWeight: "bold" }}>
                              ⚠️ No screenshot
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.status !== "confirmed" && (
                            <Button 
                              size="small" 
                              variant="contained" 
                              color="success" 
                              sx={{ 
                                mr: 1,
                                opacity: !viewedScreenshots.has(booking._id) ? 0.5 : 1,
                                cursor: !viewedScreenshots.has(booking._id) ? "not-allowed" : "pointer"
                              }}
                              disabled={!booking.paymentScreenshot || !viewedScreenshots.has(booking._id)}
                              onClick={() => handleConfirm(booking._id, booking)}
                            >
                              Confirm
                            </Button>
                          )}
                          <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(booking._id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              </>
            )}
            </Box>
          )}
          </>
          )}
        </Box>
      </Box>

      {/* Screenshot Modal */}
      <Dialog
        open={screenshotModal}
        onClose={closeScreenshotModal}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            background: themeColors.card,
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: "bold" }}>
          Payment Screenshot
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedScreenshot && (
            <img
              src={selectedScreenshot}
              alt="Payment Screenshot"
              style={{
                width: "100%",
                borderRadius: 8,
                maxHeight: 500,
                objectFit: "contain",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeScreenshotModal}
            sx={{ color: themeColors.primary }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;
