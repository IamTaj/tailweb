import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Tabs,
  Tab
} from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { api } from "../api/client"
import { useAuth } from "../auth/AuthContext"

export default function Login() {
  const [tab, setTab] = useState(0) 

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState("")
  const [fieldErr, setFieldErr] = useState({})

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerRole, setRegisterRole] = useState("")
  const [registerErr, setRegisterErr] = useState("")
  const [registerFieldErr, setRegisterFieldErr] = useState({})

  const { login } = useAuth()
  const navigate = useNavigate()

  const setError = (key, message) =>
    setFieldErr((prev) => ({ ...prev, [key]: message }))
  const clearError = (key) =>
    setFieldErr((prev) => ({ ...prev, [key]: "" }))

  const validateLogin = () => {
    const errors = {}
    if (!email.trim()) errors.email = "Username is required"
    if (!password.trim()) errors.password = "Password is required"
    setFieldErr(errors)
    return Object.keys(errors).length === 0
  }

  const validateRegister = () => {
    const errors = {}
    if (!registerName.trim()) errors.name = "Name is required"
    if (!registerEmail.trim()) errors.email = "Email is required"
    if (!registerPassword.trim()) errors.password = "Password is required"
    if (!registerRole.trim()) errors.role = "Role is required"
    setRegisterFieldErr(errors)
    return Object.keys(errors).length === 0
  }

  async function onLogin(e) {
    e.preventDefault()
    setErr("")
    if (!validateLogin()) return

    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      })
      login(data)
      navigate(data.role === "teacher" ? "/teacher" : "/student", {
        replace: true
      })
    } catch (e) {
      setErr(e?.message || "Login failed. Please try again.")
    }
  }

  async function onRegister(e) {
    e.preventDefault()
    setRegisterErr("")
    if (!validateRegister()) return

    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: registerRole
        })
      })
      setEmail(registerEmail)
      setPassword(registerPassword)
      setTab(0)
    } catch (e) {
      setRegisterErr(e?.message || "Registration failed. Please try again.")
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        px: 2
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, color: "#d32f2f", fontWeight: 700 }}>
        tailwebs<span style={{ color: "#d32f2f" }}>.</span>
      </Typography>

      <Paper sx={{ width: "100%", maxWidth: 520, p: { xs: 3, sm: 4 } }}>
        <Tabs value={tab} onChange={(_, v) => {
          setTab(v)
          setFieldErr({})
          setErr("")
          setRegisterErr("")
        }} 
        centered sx={{ mb: 3 }}
           TabIndicatorProps={{ style: { backgroundColor: "#d32f2f" } }}
           textColor="#d32f2f"
          >
          <Tab label="Login" />
          <Tab label="Register" />
        </Tabs>

        {tab === 0 && (
          <>
            {err && (
              <Typography color="error" sx={{ mb: 2 }}>
                {err}
              </Typography>
            )}
            <Stack component="form" spacing={2.5} onSubmit={onLogin}>
              <div>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="test@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (e.target.value) clearError("email")
                  }}
                  onBlur={() => {
                    if (!email.trim()) setError("email", "Username is required")
                  }}
                  error={Boolean(fieldErr.email)}
                  helperText={fieldErr.email || " "}
                />
              </div>

              <div>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (e.target.value) clearError("password")
                  }}
                  onBlur={() => {
                    if (!password.trim()) setError("password", "Password is required")
                  }}
                  error={Boolean(fieldErr.password)}
                  helperText={fieldErr.password || " "}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Box sx={{ textAlign: "right", mt: 1 }}>
                  <Button size="small" variant="text" sx={{ textTransform: "none",color:"#000" }}>
                    Forgot Password?
                  </Button>
                </Box>
              </div>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 1,
                  bgcolor: "#1f1f1f",
                  color: "#fff",
                  py: 1.2,
                  "&:hover": { bgcolor: "#000" }
                }}
              >
                Login
              </Button>
            </Stack>
          </>
        )}

        {tab === 1 && (
          <>
            {registerErr && (
              <Typography color="error" sx={{ mb: 2 }}>
                {registerErr}
              </Typography>
            )}
            <Stack component="form" spacing={1} onSubmit={onRegister}>
              <div>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
                  Name
                </Typography>
                <TextField
                  fullWidth
                  value={registerName}
                  onChange={(e) => {
                    setRegisterName(e.target.value)
                    setRegisterFieldErr((prev) => ({ ...prev, name: "" }))
                  }}
                  error={Boolean(registerFieldErr.name)}
                  helperText={registerFieldErr.name || " "}
                />
              </div>

              <div>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  value={registerEmail}
                  onChange={(e) => {
                    setRegisterEmail(e.target.value)
                    setRegisterFieldErr((prev) => ({ ...prev, email: "" }))
                  }}
                  error={Boolean(registerFieldErr.email)}
                  helperText={registerFieldErr.email || " "}
                />
              </div>

              <div>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  value={registerPassword}
                  onChange={(e) => {
                    setRegisterPassword(e.target.value)
                    setRegisterFieldErr((prev) => ({ ...prev, password: "" }))
                  }}
                  error={Boolean(registerFieldErr.password)}
                  helperText={registerFieldErr.password || " "}
                />
              </div>

              <div>
                <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "text.secondary" }}>
                  Role
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={registerRole}
                  onChange={(e) => {
                    setRegisterRole(e.target.value)
                    setRegisterFieldErr((prev) => ({ ...prev, role: "" }))
                  }}
                  error={Boolean(registerFieldErr.role)}
                  helperText={registerFieldErr.role || " "}
                  SelectProps={{ native: true }}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </TextField>
              </div>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 1,
                  bgcolor: "#1f1f1f",
                  color: "#fff",
                  py: 1.2,
                  "&:hover": { bgcolor: "#000" }
                }}
              >
                Register
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  )
}
