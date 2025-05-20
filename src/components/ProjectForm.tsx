import React, { useState, useEffect } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Switch, FormControlLabel, Typography } from '@mui/material'
import { useProjects, Project } from '../context/ProjectContext'

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
  tile_styles: {},
  links: {},
  updates: [],
  last_modified: ''
}

export default function ProjectForm({ open, onClose, initialData }) {
  const { addProject, updateProject, loading } = useProjects()
  const [form, setForm] = useState<Partial<Project>>(emptyProject)
  const isEdit = Boolean(initialData && initialData.id)

  useEffect(() => {
    if (initialData) setForm({ ...emptyProject, ...initialData })
    else setForm(emptyProject)
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // For JSON/array fields
  const handleJsonChange = (name, value) => {
    setForm((f) => ({
      ...f,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : form.tags,
      tile_styles: parseJson(form.tile_styles),
      links: parseJson(form.links),
      updates: parseJson(form.updates)
    }
    if (isEdit) await updateProject(form.id, payload)
    else await addProject(payload)
    onClose()
  }

  return (
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
              <TextField label="Status" name="status" value={form.status} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={<Switch checked={!!form.featured} onChange={handleChange} name="featured" />}
                label="Featured"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Hash" name="hash" value={form.hash} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline minRows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Summary" name="summary" value={form.summary} onChange={handleChange} fullWidth multiline minRows={2} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tags (comma separated)"
                name="tags"
                value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                onChange={handleChange}
                fullWidth
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tile Styles (JSON)"
                name="tile_styles"
                value={typeof form.tile_styles === 'string' ? form.tile_styles : JSON.stringify(form.tile_styles || {}, null, 2)}
                onChange={(e) => handleJsonChange('tile_styles', e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Links (JSON)"
                name="links"
                value={typeof form.links === 'string' ? form.links : JSON.stringify(form.links || {}, null, 2)}
                onChange={(e) => handleJsonChange('links', e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Updates (JSON Array)"
                name="updates"
                value={typeof form.updates === 'string' ? form.updates : JSON.stringify(form.updates || [], null, 2)}
                onChange={(e) => handleJsonChange('updates', e.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
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
