import { Routes, Route, Navigate, Link } from "react-router-dom"
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material"
import { useAuth } from "./auth/AuthContext"
import ProtectedRoute from "./components/ProtectedRoutes"
import Login from "./pages/Login"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import { useNavigate } from "react-router-dom"

export default function App() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#FFF !important",
          top: 0,
          zIndex: (t) => t.zIndex.appBar
        }}>
        <Toolbar>
          <Typography
            variant="h4"
            sx={{ flexGrow: 1, color: "#d32f2f", cursor: "pointer" }}
            onClick={logout}>
            tailwebs
          </Typography>
          {!user ? (
            <Button
              color="inherit"
              component={Link}
              sx={{ fontWeight: 500, color: "#000" }}
              to="/login">
              Login
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={logout}
              sx={{ fontWeight: 500, color: "#000" }}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3, mt: { xs: 8, sm: 10 } }}>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={user.role === "teacher" ? "/teacher" : "/student"}
                  replace
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  )
}
