import React, { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  publishAssignment,
  completeAssignment,
  deleteAssignment
} from "../store/features/assignmentsSlice"
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem as SelectItem,
  InputLabel,
  FormControl,
  Checkbox,
  Tabs,
  Tab
} from "@mui/material"
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded"
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded"
import AddIcon from "@mui/icons-material/Add"
import { api } from "../api/client"

function StatusChip({ status }) {
  const color =
    status === "Draft"
      ? "default"
      : status === "Published"
      ? "primary"
      : "success"
  return <Chip size="small" color={color} label={status} />
}

function AssignmentForm({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || "")
  const [description, setDescription] = useState(initial?.description || "")
  const [dueDate, setDueDate] = useState(initial?.dueDate || "")
  const [errors, setErrors] = useState({})
  const setErr = (k, v) => setErrors((p) => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!title.trim()) e.title = "Title is required"
    if (!description.trim()) e.description = "Description is required"
    if (!dueDate.trim()) e.dueDate = "Due date is required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (e.target.value) setErr("title", "")
            }}
            onBlur={() => {
              if (!title.trim()) setErr("title", "Title is required")
            }}
            error={!!errors.title}
            helperText={errors.title || " "}
          />
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (e.target.value) setErr("description", "")
            }}
            onBlur={() => {
              if (!description.trim())
                setErr("description", "Description is required")
            }}
            error={!!errors.description}
            helperText={errors.description || " "}
          />
          <TextField
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              if (e.target.value) setErr("dueDate", "")
            }}
            onBlur={() => {
              if (!dueDate.trim()) setErr("dueDate", "Due date is required")
            }}
            error={!!errors.dueDate}
            helperText={errors.dueDate || " "}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button sx={{ color: "#1f1f1f" }} onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#1f1f1f",
            color: "#fff",
            px: 4,
            borderRadius: 1.5,
            "&:hover": { bgcolor: "#000" }
          }}
          onClick={() => {
            if (!validate()) return
            onSave({ title, description, dueDate })
          }}>
          {initial ? "Update" : "Add"}
        </Button>
      </DialogActions>
    </>
  )
}

export default function TeacherDashboard() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s?.assignments)

  const [filter, setFilter] = useState("")
  const [tab, setTab] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const [subOpen, setSubOpen] = useState(false)
  const [subs, setSubs] = useState([])
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("all")

  useEffect(() => {
    loadSubmissionsFor(selectedAssignmentId)
  }, [selectedAssignmentId])

  const [anchorEl, setAnchorEl] = useState(null)
  const [menuRow, setMenuRow] = useState(null)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewItem, setReviewItem] = useState(null)
  const [reviewMark, setReviewMark] = useState("")
  const [reviewChecked, setReviewChecked] = useState(false)

  const openMenu = (evt, row) => {
    setAnchorEl(evt.currentTarget)
    setMenuRow(row)
  }
  const closeMenu = () => {
    setAnchorEl(null)
    setMenuRow(null)
  }

  useEffect(() => {
    dispatch(fetchAssignments(filter || undefined))
  }, [dispatch, filter])

  async function openSubmissions(row) {
    const list = await api(`/api/submissions/assignment/${row._id}`)
    setSubs(list)
    setSubOpen(true)
  }
  async function loadSubmissionsFor(assignmentId) {
    if (assignmentId === "all") {
      const list = await api(`/api/submissions`)
      setSubs(list)
      return
    } else {
      const list = await api(`/api/submissions/assignment/${assignmentId}`)
      setSubs(list)
    }
  }

  async function markReviewed(id, checked) {
    const updated = await api(`/api/submissions/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ reviewed: checked })
    })
    setSubs((prev) => prev.map((s) => (s._id === id ? updated : s)))
  }
  async function saveMark(id, mark) {
    const updated = await api(`/api/submissions/${id}/mark`, {
      method: "POST",
      body: JSON.stringify({ mark })
    })
    setSubs((prev) => prev.map((s) => (s._id === id ? updated : s)))
  }

  const handleOpenReview = (submission) => {
    setReviewItem(submission)
    setReviewMark(submission.mark ?? "")
    setReviewChecked(!!submission.reviewed)
    setReviewOpen(true)
  }

  const handleSaveReview = async () => {
    if (reviewItem) {
      if (!Number.isNaN(Number(reviewMark))) {
        await saveMark(reviewItem._id, Number(reviewMark))
      }
      await markReviewed(reviewItem._id, reviewChecked)
    }
    setReviewOpen(false)
    setReviewItem(null)
  }

  const rows = useMemo(() => items, [items])

  return (
    <Box sx={{ p: 2, background: "#fff" }}>
      <Tabs
        value={tab}
        onChange={(e, newValue) => setTab(newValue)}
        textColor="#d32f2f"
        sx={{ mb: 3 }}
        TabIndicatorProps={{ style: { backgroundColor: "#d32f2f" } }}>
        <Tab label="Assignments" />
        <Tab label="Submissions" />
      </Tabs>

      {tab === 0 && (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}>
            <Typography variant="h6">Assignments</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Status"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e5e5e5",
              background: "#f7f7f7",
              p: { xs: 2, sm: 3 },
              borderRadius: 2
            }}>
            <TableContainer
              sx={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 2
              }}>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "#f7f7f7",
                      "& th": {
                        borderBottom: "1px solid #eee",
                        fontWeight: 600,
                        color: "#666"
                      }
                    }}>
                    <TableCell sx={{ borderRight: "1px solid #eaeaea" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #eaeaea" }}>
                      Subject
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #eaeaea" }}>
                      Due Date
                    </TableCell>
                    <TableCell sx={{ borderRight: "1px solid #eaeaea" }}>
                      Status
                    </TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows?.map((r) => (
                    <TableRow
                      key={r._id}
                      hover
                      sx={{ "& td": { borderBottom: "1px solid #f0f0f0" } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: "#5DA9FF",
                              fontSize: 14
                            }}>
                            {(r.title || "A").slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box sx={{ fontWeight: 500 }}>{r.title}</Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell>{r.dueDate}</TableCell>
                      <TableCell>
                        <StatusChip status={r.status || "Draft"} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => openMenu(e, r)}
                          size="small"
                          sx={{
                            bgcolor: "#f0f0f0",
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                            "&:hover": { bgcolor: "#e5e5e5" }
                          }}>
                          {anchorEl && menuRow?._id === r._id ? (
                            <KeyboardArrowUpRounded fontSize="small" />
                          ) : (
                            <KeyboardArrowDownRounded fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ color: "text.secondary" }}>
                        No assignments
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddOpen(true)}
                sx={{
                  bgcolor: "#1f1f1f",
                  color: "#fff",
                  px: 4,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: "#000" }
                }}>
                Add
              </Button>
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              PaperProps={{ sx: { mt: 0.5, boxShadow: 3, borderRadius: 1.5 } }}>
              {menuRow?.status !== "Completed" && (
                <MenuItem
                  onClick={() => {
                    setEditItem(menuRow)
                    closeMenu()
                  }}>
                  Edit
                </MenuItem>
              )}
              {menuRow?.status === "Draft" && (
                <MenuItem
                  onClick={() => {
                    dispatch(publishAssignment(menuRow._id))
                    closeMenu()
                  }}>
                  Publish
                </MenuItem>
              )}
              {menuRow?.status === "Published" && (
                <MenuItem
                  onClick={() => {
                    dispatch(completeAssignment(menuRow._id))
                    closeMenu()
                  }}>
                  Mark Completed
                </MenuItem>
              )}
              <MenuItem
                onClick={() => {
                  dispatch(deleteAssignment(menuRow._id))
                  closeMenu()
                }}>
                Delete
              </MenuItem>
            </Menu>
          </Paper>
        </>
      )}

      {tab === 1 && (
        <Box sx={{ mt: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1 }}
            spacing={2}>
            <Typography variant="h6">Submissions</Typography>
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel id="assignment-select-label">
                Select assignment
              </InputLabel>
              <Select
                labelId="assignment-select-label"
                label="Select assignment"
                value={selectedAssignmentId}
                onChange={async (e) => {
                  const aid = e.target.value
                  setSelectedAssignmentId(aid)
                }}>
                <SelectItem value="all">All</SelectItem>
                {rows.map((r) => (
                  <SelectItem key={r._id} value={r._id}>
                    {r.title}
                  </SelectItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e5e5e5",
              background: "#f7f7f7",
              p: { xs: 2, sm: 3 },
              borderRadius: 2
            }}>
            <TableContainer
              sx={{
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 2
              }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      background: "#f7f7f7",
                      "& th": {
                        borderBottom: "1px solid #eee",
                        fontWeight: 600,
                        color: "#666"
                      }
                    }}>
                    <TableCell>Student</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Mark</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subs.map((s) => (
                    <TableRow key={s._id}>
                      {console.log(s)}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 28, height: 28 }}>
                            {(s.studentName || "S").slice(0, 1).toUpperCase()}
                          </Avatar>
                          <Box>{s.studentName}</Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{s.assignmentTitle || "-"}</TableCell>
                      <TableCell>{s.mark ?? "-"}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            bgcolor: "#1f1f1f",
                            color: "#fff",
                            px: 4,
                            borderRadius: 1.5,
                            "&:hover": { bgcolor: "#000", color: "#fff" }
                          }}
                          onClick={() => handleOpenReview(s)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ color: "text.secondary" }}>
                        Select an assignment to view submissions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>New Assignment</DialogTitle>
        <AssignmentForm
          onClose={() => setAddOpen(false)}
          onSave={async (payload) => {
            await dispatch(createAssignment(payload))
            setAddOpen(false)
            dispatch(fetchAssignments(filter || undefined))
          }}
        />
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>Review Submission</DialogTitle>
        <DialogContent dividers>
          {reviewItem && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                {reviewItem.studentName}
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "#f9f9f9",
                  borderRadius: 1,
                  maxHeight: 240,
                  overflowY: "auto",
                  whiteSpace: "pre-wrap"
                }}>
                {reviewItem.answer}
              </Box>
              <TextField
                type="number"
                size="small"
                label="Marks"
                inputProps={{ min: 0, max: 100 }}
                value={reviewMark}
                onChange={(e) => setReviewMark(e.target.value)}
              />
              <FormControl>
                <Stack direction="row" alignItems="center">
                  <Checkbox
                    checked={reviewChecked}
                    onChange={(e) => setReviewChecked(e.target.checked)}
                  />
                  <Typography>Mark as Reviewed</Typography>
                </Stack>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            sx={{ color: "#1f1f1f" }}
            onClick={() => setReviewOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#1f1f1f",
              color: "#fff",
              px: 4,
              borderRadius: 1.5,
              "&:hover": { bgcolor: "#000" }
            }}
            onClick={handleSaveReview}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={!!editItem}
        onClose={() => setEditItem(null)}
        fullWidth
        maxWidth="sm">
        <DialogTitle>Edit Assignment</DialogTitle>
        {editItem && (
          <AssignmentForm
            initial={editItem}
            onClose={() => setEditItem(null)}
            onSave={async (payload) => {
              await dispatch(updateAssignment({ id: editItem._id, payload }))
              setEditItem(null)
              dispatch(fetchAssignments(filter || undefined))
            }}
          />
        )}
      </Dialog>
    </Box>
  )
}
