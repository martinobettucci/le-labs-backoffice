import React, { useState } from 'react'
import { CssBaseline, Container, Box, Button, Snackbar, Alert } from '@mui/material'
import { ProjectProvider } from './context/ProjectContext'
import ProjectTable from './components/ProjectTable'
import ProjectForm from './components/ProjectForm'
import ProjectDetails from './components/ProjectDetails'

export default function App() {
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [details, setDetails] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  // DEBUG: Confirm App renders
  if (typeof window !== 'undefined') {
    window.__APP_RENDERED = true
    // Add a debug marker to the DOM
    if (!document.getElementById('debug-app-loaded')) {
      const marker = document.createElement('div')
      marker.id = 'debug-app-loaded'
      marker.style.position = 'fixed'
      marker.style.top = '0'
      marker.style.left = '0'
      marker.style.background = 'lime'
      marker.style.color = 'black'
      marker.style.zIndex = '9999'
      marker.style.fontWeight = 'bold'
      marker.style.padding = '4px 8px'
      marker.innerText = 'App Loaded'
      document.body.appendChild(marker)
    }
  }

  const handleEdit = (project) => {
    setEditData(project)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditData(null)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditData(null)
  }

  return (
    <ProjectProvider>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <h1 style={{ margin: 0 }}>le_labs_project Admin</h1>
          <Button variant="contained" color="primary" onClick={handleAdd}>Add Project</Button>
        </Box>
        {/* DEBUG: Show visible marker */}
        <div style={{ color: 'green', fontWeight: 'bold', marginBottom: 8 }}>App Loaded</div>
        {details && (
          <ProjectDetails project={details} />
        )}
        <ProjectTable
          onEdit={(project) => {
            setEditData(project)
            setFormOpen(true)
          }}
        />
        <ProjectForm
          open={formOpen}
          onClose={handleCloseForm}
          initialData={editData}
        />
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ProjectProvider>
  )
}
