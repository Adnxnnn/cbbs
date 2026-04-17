import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Paper,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/config";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const MotionTypography = motion(Typography);

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  // Class options fetched from backend
  const [classOptions, setClassOptions] = useState([]);

  
  React.useEffect(() => {
    // Fetch class options from backend
    fetch(`${API_BASE}/classes`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch classes");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setClassOptions(data.map(cls => cls.name));
        } else {
          throw new Error("No classes found");
        }
      })
      .catch(() => {
        // fallback to default if backend fails
        setClassOptions(["BSC IT", "BCA A", "BCA B", "BCA C", "BSC CS"]);
      });
  }, []);

  const theme = {
    bg: "linear-gradient(135deg, #202020ff 0%, #030024ff 50%, #272727ff 100%)",
    card: "rgba(0, 0, 0, 0.4)",
    primary: "#FF3B30",
    hover: "#5393ff",
    text: "#e0e0e0",
    muted: "#a0a0a0",
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !selectedClass) {
      alert("Please fill in all fields, including class");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, className: selectedClass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      alert("Account created successfully! Please login.");
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: theme.bg, color: theme.text, position: "relative", overflow: "hidden" }}>
      {/* Background Animation */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "-20%",
            left: "-10%",
            width: "60vw",
            height: "60vw",
            background: `radial-gradient(circle, ${theme.primary}20 0%, transparent 70%)`,
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            bottom: "-20%",
            right: "-10%",
            width: "70vw",
            height: "70vw",
            background: "radial-gradient(circle, rgba(41,121,255,0.15) 0%, transparent 70%)",
            filter: "blur(100px)",
            borderRadius: "50%",
          }}
        />
      </Box>

      {/* Navbar */}
      <Container maxWidth="sm" sx={{ py: 14, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, minHeight: "80vh", justifyContent: "center" }}>
        <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="CBBS Logo"
              sx={{ height: 80, width: "auto" }}
            />
          </Box>
          <MotionTypography
            variant="h3"
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            sx={{
              fontWeight: "bold",
              mb: 2,
              textAlign: "center",
              background: `linear-gradient(110deg, #ccc 30%, #ccc 45%, #fff 50%, #ccc 55%, #ccc 70%)`,
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Create Your Account
          </MotionTypography>
          <Typography variant="h6" sx={{ color: theme.muted, textAlign: "center", mb: 6 }}>
            Join us to book your college bus seats easily.
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ width: "100%" }}>
          <Paper
            sx={{
              p: 4,
              background: theme.card,
              backdropFilter: "blur(12px)",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            }}
          >
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: theme.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.primary },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: theme.text }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: theme.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.primary },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: theme.text }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: theme.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.primary },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: theme.text }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: theme.text }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Class Dropdown */}
              <TextField
                select
                label="Class"
                variant="outlined"
                fullWidth
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                SelectProps={{ native: true }}
                InputLabelProps={{ style: { color: "#fff" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": { borderColor: "#555" },
                    "&:hover fieldset": { borderColor: theme.primary },
                    "&.Mui-focused fieldset": { borderColor: theme.primary },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: theme.primary },
                }}
              >
                <option value="" style={{ color: "black" }}></option>
                {classOptions.map((cls) => (
                  <option key={cls} value={cls} style={{ color: "black" }}>{cls}</option>
                ))}
              </TextField>

              <Button
                onClick={handleSignup}
                disabled={loading}
                sx={{
                  background: theme.primary,
                  color: "#fff",
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  "&:hover": { background: theme.hover, transform: "scale(1.02)" },
                  transition: "all 0.2s",
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "SIGNUP"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Typography variant="body2" sx={{ color: theme.text }}>
                  Already have an account?{" "}
                  <span
                    style={{ color: theme.primary, cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => navigate("/")}
                  >
                    Login
                  </span>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Signup;
