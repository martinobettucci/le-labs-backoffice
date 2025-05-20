import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Grid, TextField, IconButton, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'

const DEFAULT_LINKS = [
  { key: 'demo', label: 'Demo', placeholder: 'https://demo.example.com' },
  { key: 'video', label: 'Video', placeholder: 'https://youtube.com/embed/...' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/...' },
  { key: 'license', label: 'License', placeholder: 'https://opensource.org/licenses/...' },
  { key: 'documentation', label: 'Documentation', placeholder: 'https://docs.example.com/...' }
]

function isValidUrl(url) {
  try {
    if (!url) return true
    new URL(url)
    return true
  } catch {
    return false
  }
}

export default function LinksEditor({ open, onClose, value, onSave }) {
  const [links, setLinks] = useState(() => {
    if (value && typeof value === 'object') {
      return Object.entries(value).map(([key, val]) => ({ key, value: val }))
    }
    return []
  })
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [error, setError] = useState('')

  // Reset state when opened
  React.useEffect(() => {
    if (open) {
      setLinks(
        value && typeof value === 'object'
          ? Object.entries(value).map(([key, val]) => ({ key, value: val }))
          : []
      )
      setNewKey('')
      setNewValue('')
      setError('')
    }
  }, [open, value])

  const handleAdd = () => {
    if (!newKey.trim()) {
      setError('Key is required')
      return
    }
    if (!isValidUrl(newValue)) {
      setError('Invalid URL')
      return
    }
    if (links.some(l => l.key === newKey.trim())) {
      setError('Key already exists')
      return
    }
    setLinks([...links, { key: newKey.trim(), value: newValue.trim() }])
    setNewKey('')
    setNewValue('')
    setError('')
  }

  const handleChange = (idx, field, val) => {
    setLinks(links.map((l, i) => i === idx ? { ...l, [field]: val } : l))
  }

  const handleDelete = (idx) => {
    setLinks(links.filter((_, i) => i !== idx))
  }

  const handleSave = () => {
    // Validate all URLs
    for (const l of links) {
      if (!isValidUrl(l.value)) {
        setError(`Invalid URL for key "${l.key}"`)
        return
      }
    }
    setError('')
    const obj = {}
    links.forEach(({ key, value }) => {
      if (key && value) obj[key] = value
    })
    onSave(obj)
    onClose()
  }

  const handleFillDefault = () => {
    setLinks(DEFAULT_LINKS.map(({ key, placeholder }) => ({
      key,
      value: placeholder
    })))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Project Links</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button size="small" onClick={handleFillDefault} variant="outlined">Fill with Example Links</Button>
        </Box>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={5}><b>Key</b></Grid>
          <Grid item xs={6}><b>URL</b></Grid>
          <Grid item xs={1}></Grid>
          {links.map((link, idx) => (
            <React.Fragment key={link.key}>
              <Grid item xs={5}>
                <TextField
                  value={link.key}
                  onChange={e => handleChange(idx, 'key', e.target.value)}
                  size="small"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  value={link.value}
                  onChange={e => handleChange(idx, 'value', e.target.value)}
                  size="small"
                  fullWidth
                  error={!!link.value && !isValidUrl(link.value)}
                  helperText={!!link.value && !isValidUrl(link.value) ? 'Invalid URL' : ''}
                />
              </Grid>
              <Grid item xs={1}>
                <Tooltip title="Remove">
                  <IconButton onClick={() => handleDelete(idx)} size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </React.Fragment>
          ))}
          <Grid item xs={5}>
            <TextField
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              size="small"
              placeholder="Key"
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              size="small"
              placeholder="URL"
              fullWidth
              error={!!newValue && !isValidUrl(newValue)}
              helperText={!!newValue && !isValidUrl(newValue) ? 'Invalid URL' : ''}
            />
          </Grid>
          <Grid item xs={1}>
            <Tooltip title="Add Link">
              <IconButton onClick={handleAdd} size="small" color="primary">
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        {error && <Box sx={{ color: 'red', mt: 2 }}>{error}</Box>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  )
}
