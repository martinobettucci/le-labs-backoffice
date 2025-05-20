import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, TextField, Typography, Paper } from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import { hashObject } from '../lib/hash'

function emptyUpdate() {
  return {
    date: '',
    hash: '',
    title: '',
    content: ''
  }
}

// Helper to format date for datetime-local input
function formatDateForInput(dateStr) {
  if (!dateStr) return ''
  // Try to parse as ISO or fallback
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  // Pad to YYYY-MM-DDTHH:mm
  const pad = (n) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function UpdatesEditor({ open, onClose, value = [], onSave }) {
  const [updates, setUpdates] = useState(Array.isArray(value) ? value : [])
  const [editIdx, setEditIdx] = useState(-1)
  const [editUpdate, setEditUpdate] = useState(emptyUpdate())

  // Sync updates state with value prop when dialog opens or value changes
  useEffect(() => {
    if (open) {
      setUpdates(Array.isArray(value) ? value : [])
      setEditIdx(-1)
      setEditUpdate(emptyUpdate())
    }
    // eslint-disable-next-line
  }, [open, value])

  const handleEdit = (idx) => {
    setEditIdx(idx)
    // Format date for input
    setEditUpdate({
      ...updates[idx],
      date: formatDateForInput(updates[idx].date)
    })
  }

  const handleDelete = (idx) => {
    setUpdates(updates.filter((_, i) => i !== idx))
  }

  const handleAdd = () => {
    setEditIdx(updates.length)
    setEditUpdate(emptyUpdate())
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditUpdate((u) => ({
      ...u,
      [name]: value
    }))
  }

  const handleSaveEdit = () => {
    let newUpdates = [...updates]
    // Store as ISO string if date is present
    const updateToSave = {
      ...editUpdate,
      date: editUpdate.date ? new Date(editUpdate.date).toISOString() : ''
    }
    // Calculate hash
    updateToSave.hash = hashObject(updateToSave, 'hash')
    if (editIdx === updates.length) {
      newUpdates.push(updateToSave)
    } else {
      newUpdates[editIdx] = updateToSave
    }
    setUpdates(newUpdates)
    setEditIdx(-1)
    setEditUpdate(emptyUpdate())
  }

  const handleCancelEdit = () => {
    setEditIdx(-1)
    setEditUpdate(emptyUpdate())
  }

  const handleDialogSave = () => {
    onSave(updates)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Project Updates</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Button variant="contained" startIcon={<Add />} onClick={handleAdd}>Add Update</Button>
        </Box>
        {updates.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>No updates yet.</Typography>
        )}
        <Box>
          {updates.map((upd, idx) => (
            <Paper key={upd.hash || idx} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', position: 'relative' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2">{upd.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatDateForInput(upd.date)}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{upd.content}</Typography>
                  <Typography variant="caption" color="text.secondary">Hash: {upd.hash}</Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleEdit(idx)}><Edit fontSize="small" /></IconButton>
                  <IconButton onClick={() => handleDelete(idx)}><Delete fontSize="small" /></IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
        {/* Edit/Add form */}
        {editIdx !== -1 && (
          <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#fafafa' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>{editIdx === updates.length ? 'Add Update' : 'Edit Update'}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  name="date"
                  type="datetime-local"
                  value={editUpdate.date}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hash"
                  name="hash"
                  value={
                    // Show calculated hash for preview
                    hashObject({
                      ...editUpdate,
                      date: editUpdate.date ? new Date(editUpdate.date).toISOString() : ''
                    }, 'hash')
                  }
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText="Automatically calculated from update content"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  name="title"
                  value={editUpdate.title}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Content"
                  name="content"
                  value={editUpdate.content}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                  required
                />
              </Grid>
            </Grid>
            <Box mt={2} display="flex" gap={1}>
              <Button variant="contained" color="primary" onClick={handleSaveEdit}>Save</Button>
              <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>Cancel</Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">Cancel</Button>
        <Button onClick={handleDialogSave} color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}
