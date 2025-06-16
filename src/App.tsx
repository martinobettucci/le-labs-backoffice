import React, { useState, useEffect } from 'react'
import { CssBaseline, Box, Button, Snackbar, Alert, Typography, Paper } from '@mui/material'
import { ProjectProvider } from './context/ProjectContext'
import ProjectTable from './components/ProjectTable'
import ProjectForm from './components/ProjectForm'
import ProjectDetails from './components/ProjectDetails'
import './App.css'

// Environment check
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export default function App() {
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [details, setDetails] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [envCheck, setEnvCheck] = useState(true)

  // Check environment variables
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) {
      setEnvCheck(false)
      console.error('Missing Supabase environment variables')
    }
  }, [])

  // DEBUG: Confirm App renders
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__APP_RENDERED = true
      console.log('App component mounted successfully')
    }
  }, [])

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

  // Show environment error if missing variables
  if (!envCheck) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          p: 3
        }}
      >
        <Paper
          sx={{
            p: 4,
            maxWidth: 600,
            textAlign: 'center',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            ⚠️ Configuration Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Missing Supabase environment variables. Please check your <code>.env</code> file and ensure you have:
          </Typography>
          <Box
            sx={{
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: 2,
              fontFamily: 'monospace',
              textAlign: 'left',
              mb: 3
            }}
          >
            <div>VITE_SUPABASE_URL=your_supabase_url</div>
            <div>VITE_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Click "Connect to Supabase" in the top right corner to set up your database connection.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <ProjectProvider>
      <CssBaseline />
      <div className="container" style={{ minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
        {/* Header with gradient background */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: 4,
            px: { xs: 2, md: 4 },
            mb: 4
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: '1400px',
              mx: 'auto'
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                le_labs_project
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Admin Dashboard
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={handleAdd}
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                }
              }}
            >
              Add Project
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            maxWidth: '1400px',
            mx: 'auto',
            px: { xs: 2, md: 4 },
            pb: 4
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 4,
              minHeight: 0,
              minWidth: 0
            }}
          >
            {/* Details Panel */}
            {details && (
              <Box sx={{ flex: { lg: '0 0 400px' }, minWidth: 0 }}>
                <ProjectDetails project={details} />
              </Box>
            )}
            
            {/* Main Table */}
            <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <ProjectTable
                onEdit={handleEdit}
                onViewDetails={setDetails}
              />
            </Box>
          </Box>
        </Box>

        {/* Project Form Modal */}
        <ProjectForm
          open={formOpen}
          onClose={handleCloseForm}
          initialData={editData}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              fontWeight: 500
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Debug indicator (remove in production) */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            left: 16,
            bgcolor: 'success.main',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 1000,
            opacity: 0.8
          }}
        >
          ✅ App Loaded Successfully
        </Box>
      </div>
    </ProjectProvider>
  )
}