import React, { useEffect, useState } from "react"
import { api } from "../api/client"
import { Typography, Paper, Stack, Button, TextField } from "@mui/material"

export default function StudentDashboard() {
  const [list, setList] = useState([])
  const [answer, setAnswer] = useState({})
  const [mine, setMine] = useState({})
  const [err, setErr] = useState("")

  async function load() {
    const assignments = await api("/api/assignments")
    setList(assignments)
    const own = {}
    for (const a of assignments) {
      try {
        own[a._id] = await api(`/api/submissions/my/${a._id}`)
      } catch {}
    }
    setMine(own)
  }

  useEffect(() => {
    load().catch(console.error)
  }, [])

  async function submit(aid) {
    setErr("")
    const text = (answer[aid] || "").trim()
    if (!text) {
      setErr("Answer cannot be empty.")
      return
    }
    try {
      const resp = await api(`/api/submissions/${aid}`, {
        method: "POST",
        body: JSON.stringify({ answer: text })
      })
      setMine((prev) => ({ ...prev, [aid]: resp }))
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Student Dashboard</Typography>
      {err && <Typography color="error">{err}</Typography>}

      {list.map((a) => (
        <Paper key={a._id} sx={{ p: 2 }}>
          <Typography variant="h6">{a.title}</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Due: {a.dueDate}
          </Typography>
          <Typography sx={{ my: 1 }}>{a.description}</Typography>

          {mine[a._id] ? (
            <Stack
              spacing={1}
              sx={{
                background: "#f8f8f8",
                p: 1
              }}>
              <Typography variant="subtitle2">Your submission</Typography>
              <Stack
                sx={{
                  maxHeight: 300,
                  overflowY: "auto"
                }}>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>
                  {mine[a._id].answer}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Submitted: {new Date(mine[a._id].submittedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Reviewed: {mine[a._id].reviewed ? "Yes" : "No"}
                {typeof mine[a._id].mark === "number"
                  ? ` • Mark: ${mine[a._id].mark}`
                  : ""}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1}>
              <TextField
                label="Your answer"
                multiline
                minRows={3}
                value={answer[a._id] || ""}
                onChange={(e) =>
                  setAnswer((prev) => ({ ...prev, [a._id]: e.target.value }))
                }
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#1f1f1f",
                  color: "#fff",
                  px: 4,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: "#000" }
                }}
                onClick={() => submit(a._id)}
                disabled={!(answer[a._id] || "").trim()}>
                Submit
              </Button>
            </Stack>
          )}
        </Paper>
      ))}
      {list.length === 0 && (
        <Typography color="text.secondary">No published assignments</Typography>
      )}
    </Stack>
  )
}
