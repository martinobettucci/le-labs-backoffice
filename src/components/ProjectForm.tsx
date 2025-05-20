import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Switch, FormControlLabel, Typography, MenuItem, Select, InputLabel, FormControl, ListItemText, ListItemIcon, Chip, OutlinedInput, Autocomplete, createFilterOptions } from '@mui/material'
import { useProjects, Project } from '../context/ProjectContext'
import LinksEditor from './LinksEditor'
import UpdatesEditor from './UpdatesEditor'
import { hashObject, md5 } from '../lib/hash'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const emptyProject: Partial<Project> = {
  id: '',
  title: '',
  slug: '',
  status: '',
  featured: false,
  hash: '',
  description: '',
  summary: '',
  tags: [],
  last_updated: '',
  image: '',
  tile_styles: { color: '#FFFFFF', background: '#8C5223' },
  links: {},
  updates: [],
  last_modified: ''
}

// Helper to format date for datetime-local input
function formatDateForInput(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Helper to parse input value back to ISO string (optional, for saving)
function parseInputDate(val: string) {
  if (!val) return ''
  // val is in "YYYY-MM-DDTHH:mm"
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  return d.toISOString()
}

// Convert first 6 hex chars of md5 hash to color
function statusToColor(status: string) {
  if (!status) return '#CCCCCC'
  const hex = md5(status).slice(0, 6)
  return `#${hex}`
}

export default function ProjectForm({ open, onClose, initialData }) {
  const { addProject, updateProject, loading } = useProjects()
  const [form, setForm] = useState<Partial<Project>>(emptyProject)
  const [linksEditorOpen, setLinksEditorOpen] = useState(false)
  const [updatesEditorOpen, setUpdatesEditorOpen] = useState(false)
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [statusInput, setStatusInput] = useState('')
  const [tagOptions, setTagOptions] = useState<string[]>([])
  const isEdit = Boolean(initialData && initialData.id)

  // Fetch unique statuses from Supabase
  useEffect(() => {
    async function fetchStatuses() {
      const { data, error } = await supabase
        .from('le_labs_project')
        .select('status')
      if (!error && data) {
        const unique = Array.from(new Set(data.map((row) => row.status).filter(Boolean)))
        setStatusOptions(unique)
      }
    }
    if (open) fetchStatuses()
  }, [open])

  // Fetch unique tags from Supabase
  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase
        .from('le_labs_project')
        .select('tags')
      if (!error && data) {
        // tags is a JSON array or stringified array
        const allTags = data
          .map((row) => {
            if (!row.tags) return []
            if (Array.isArray(row.tags)) return row.tags
            try {
              return JSON.parse(row.tags)
            } catch {
              return []
            }
          })
          .flat()
          .filter(Boolean)
        const unique = Array.from(new Set(allTags))
        setTagOptions(unique)
      }
    }
    if (open) fetchTags()
  }, [open])

  useEffect(() => {
    if (initialData) {
      setForm({
        ...emptyProject,
        ...initialData,
        tile_styles: {
          color: initialData.tile_styles?.color || '#FFFFFF',
          background: initialData.tile_styles?.background || '#8C5223'
        },
        updates: Array.isArray(initialData.updates) ? initialData.updates : [],
        last_updated: formatDateForInput(initialData.last_updated),
        last_modified: formatDateForInput(initialData.last_modified)
      })
      setStatusInput(initialData.status || '')
    } else {
      setForm(emptyProject)
      setStatusInput('')
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (name === 'status') setStatusInput(value)
  }

  // For array fields
  const handleArrayChange = (name, value) => {
    setForm((f) => ({
      ...f,
      [name]: value
    }))
  }

  const handleLinksSave = (linksObj) => {
    setForm((f) => ({
      ...f,
      links: linksObj
    }))
  }

  const handleUpdatesSave = (updatesArr) => {
    setForm((f) => ({
      ...f,
      updates: updatesArr
    }))
  }

  const handleStyleColorChange = (field, value) => {
    setForm((f) => ({
      ...f,
      tile_styles: {
        ...f.tile_styles,
        [field]: value
      }
    }))
  }

  const handleStatusSelect = (e) => {
    setForm((f) => ({
      ...f,
      status: e.target.value
    }))
    setStatusInput(e.target.value)
  }

  const handleStatusInput = (e) => {
    setForm((f) => ({
      ...f,
      status: e.target.value
    }))
    setStatusInput(e.target.value)
  }

  // Tag multi-select handlers
  const handleTagsChange = (event, value) => {
    // value is an array of strings (tags)
    setForm((f) => ({
      ...f,
      tags: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      tags: Array.isArray(form.tags)
        ? form.tags.map((t) => t.trim()).filter(Boolean)
        : typeof form.tags === 'string'
        ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      tile_styles: form.tile_styles,
      links: form.links,
      updates: form.updates,
      last_updated: form.last_updated ? new Date(form.last_updated).toISOString() : '',
      last_modified: form.last_modified ? new Date(form.last_modified).toISOString() : ''
    }
    // Calculate hash (excluding hash field itself)
    payload.hash = hashObject(payload, 'hash')
    if (isEdit) await updateProject(form.id, payload)
    else await addProject(payload)
    onClose()
  }

  // For tag autocomplete: allow custom entry
  const filter = createFilterOptions<string>()

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Project' : 'Add Project'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="ID" name="id" value={form.id} onChange={handleChange} fullWidth required={!isEdit} disabled={isEdit} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Slug" name="slug" value={form.slug} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={statusInput}
                    label="Status"
                    onChange={handleStatusSelect}
                    renderValue={(selected) => (
                      <Box display="flex" alignItems="center" gap={1}>
                        <span style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          borderRadius: 4,
                          background: statusToColor(selected),
                          marginRight: 8,
                          border: '1px solid #ccc'
                        }} />
                        <span>{selected}</span>
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 300 }
                      }
                    }}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <span style={{
                            display: 'inline-block',
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            background: statusToColor(status),
                            border: '1px solid #ccc'
                          }} />
                        </ListItemIcon>
                        <ListItemText primary={status} />
                      </MenuItem>
                    ))}
                    <MenuItem value="">
                      <em>Custom...</em>
                    </MenuItem>
                  </Select>
                  {/* If not in options, allow manual entry */}
                  {!statusOptions.includes(statusInput) && (
                    <TextField
                      label="Custom Status"
                      value={statusInput}
                      onChange={handleStatusInput}
                      fullWidth
                      sx={{ mt: 1 }}
                      InputProps={{
                        startAdornment: (
                          <span style={{
                            display: 'inline-block',
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            background: statusToColor(statusInput),
                            marginRight: 8,
                            border: '1px solid #ccc'
                          }} />
                        )
                      }}
                    />
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={!!form.featured} onChange={handleChange} name="featured" />}
                  label="Featured"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Hash" name="hash" value={hashObject({ ...form, last_updated: form.last_updated ? new Date(form.last_updated).toISOString() : '', last_modified: form.last_modified ? new Date(form.last_modified).toISOString() : '' }, 'hash')} fullWidth InputProps={{ readOnly: true }} helperText="Automatically calculated from project content" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline minRows={2} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Summary" name="summary" value={form.summary} onChange={handleChange} fullWidth multiline minRows={2} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={tagOptions}
                  value={Array.isArray(form.tags) ? form.tags : []}
                  onChange={handleTagsChange}
                  filterOptions={(options, params) => {
                    const filtered = filter(options, params)
                    // Suggest the creation of a new value
                    const inputValue = params.inputValue.trim()
                    if (inputValue !== '' && !options.includes(inputValue)) {
                      filtered.push(inputValue)
                    }
                    return filtered
                  }}
                  renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                      <Chip
                        variant="filled"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                        sx={{
                          background: statusToColor(option),
                          color: '#fff',
                          fontWeight: 500,
                          marginRight: 0.5,
                          marginBottom: 0.5,
                          borderRadius: 2,
                          textTransform: 'capitalize'
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Tags"
                      placeholder="Add or select tags"
                      helperText="Select from existing or add new tags"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Updated"
                  name="last_updated"
                  value={form.last_updated}
                  onChange={handleChange}
                  fullWidth
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Image URL" name="image" value={form.image} onChange={handleChange} fullWidth />
                {form.image && (
                  <Box mt={1}>
                    <img src={form.image} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                  </Box>
                )}
              </Grid>
              {/* Color pickers for tile_styles */}
              <Grid item xs={12} sm={3}>
                <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                  <Typography variant="subtitle2" gutterBottom>Color</Typography>
                  <input
                    type="color"
                    value={form.tile_styles?.color || '#FFFFFF'}
                    onChange={e => handleStyleColorChange('color', e.target.value)}
                    style={{ width: 48, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                  />
                  <Typography variant="caption" color="textSecondary">{form.tile_styles?.color}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                  <Typography variant="subtitle2" gutterBottom>Background</Typography>
                  <input
                    type="color"
                    value={form.tile_styles?.background || '#8C5223'}
                    onChange={e => handleStyleColorChange('background', e.target.value)}
                    style={{ width: 48, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                  />
                  <Typography variant="caption" color="textSecondary">{form.tile_styles?.background}</Typography>
                </Box>
              </Grid>
              {/* End color pickers */}
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setLinksEditorOpen(true)}
                    sx={{ whiteSpace: 'nowrap', minWidth: 0, px: 2 }}
                  >
                    Edit Links
                  </Button>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                    {form.links && Object.keys(form.links).length > 0 ? `${Object.keys(form.links).length} links` : 'No links'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setUpdatesEditorOpen(true)}
                    sx={{ whiteSpace: 'nowrap', minWidth: 0, px: 2 }}
                  >
                    Edit Updates
                  </Button>
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                    {form.updates && form.updates.length > 0 ? `${form.updates.length} updates` : 'No updates'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Modified"
                  name="last_modified"
                  value={form.last_modified}
                  onChange={handleChange}
                  fullWidth
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="secondary" variant="outlined">Cancel</Button>
            <Button type="submit" color="primary" variant="contained" disabled={loading}>
              {isEdit ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <LinksEditor
        open={linksEditorOpen}
        onClose={() => setLinksEditorOpen(false)}
        value={typeof form.links === 'string' ? parseJson(form.links) : form.links}
        onSave={handleLinksSave}
      />
      <UpdatesEditor
        open={updatesEditorOpen}
        onClose={() => setUpdatesEditorOpen(false)}
        value={Array.isArray(form.updates) ? form.updates : []}
        onSave={handleUpdatesSave}
      />
    </>
  )
}

// Helper
function parseJson(val: any) {
  if (!val) return {}
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    return {}
  }
}
