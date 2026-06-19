import { useState } from 'react'
import { CssBaseline, Box, Button, Snackbar, Alert, Typography, Container, Fade, Slide } from '@mui/material'
import type { AlertColor } from '@mui/material'
import { Add as AddIcon, Dashboard as DashboardIcon } from '@mui/icons-material'
import { ProjectProvider } from './context/ProjectContext'
import type { Project } from './context/ProjectContext'
import ProjectGrid from './components/ProjectGrid'
import ProjectForm from './components/ProjectForm'
import ProjectDetails from './components/ProjectDetails'
import DashboardStats from './components/DashboardStats'
import LoginModal, { OpenModal } from './components/LoginModal'
import './App.css'

export default function App() {
  const [formOpen, setFormOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [editData, setEditData] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleEdit = (project: Project) => {
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

  const handleLogin = () => {
    setLoginOpen(true)
  }

  const handleCloseLogin = () => {
    setLoginOpen(false)
  }

  const showSnackbar = (message: string, severity: AlertColor = 'success') => {
    setSnackbar({ open: true, message, severity })
  }

  return (
    <ProjectProvider>
      <CssBaseline />
      
      {/* Background with animated gradients */}
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%),
            linear-gradient(45deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 245, 251, 0.9) 100%)
          `,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, rgba(255, 107, 107, 0.1), rgba(255, 142, 83, 0.1))',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />

        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            overflow: 'hidden' 
          }}
        >
          {/* Header background pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
              `
            }}
          />
          
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 6,
                px: { xs: 2, md: 0 }
              }}
            >
              <Fade in timeout={800}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 3,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 800, 
                        color: 'white',
                        mb: 0.5,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      le_labs_project
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 400
                      }}
                    >
                      Project Management Dashboard
                    </Typography>
                  </Box>
                </Box>
              </Fade>

              <Slide direction="left" in timeout={800}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    data-testid="new-project"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAdd}
                    size="large"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    New Project
                  </Button>
                  
                  <OpenModal handleLogin={handleLogin} />
                  
                </Box>
              </Slide>
            </Box>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Box>
              {/* Dashboard Stats */}
              <Box sx={{ mb: 6 }}>
                <DashboardStats />
              </Box>

              {/* Projects Grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', xl: 'row' },
                  gap: 4,
                  minHeight: 0
                }}
              >
                {/* Main Grid */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <ProjectGrid
                    onEdit={handleEdit}
                    onSelect={setSelectedProject}
                    selectedProject={selectedProject}
                  />
                </Box>

                {/* Details Panel */}
                {selectedProject && (
                  <Slide direction="left" in timeout={500}>
                    <Box sx={{ width: { xl: 400 }, flexShrink: 0 }}>
                      <ProjectDetails 
                        project={selectedProject} 
                        onClose={() => setSelectedProject(null)}
                      />
                    </Box>
                  </Slide>
                )}
              </Box>
            </Box>
          </Fade>
        </Container>

        {/* Project Form Modal */}
        <ProjectForm
          open={formOpen}
          onClose={handleCloseForm}
          initialData={editData}
          onSuccess={(message) => showSnackbar(message)}
        />

        {/* Login Modal */}
        <LoginModal
          open={loginOpen}
          onClose={handleCloseLogin}
          onSuccess={(message) => showSnackbar(message, 'success')}
          onError={(message) => showSnackbar(message, 'error')}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity}
            sx={{ 
              borderRadius: 3,
              fontWeight: 500,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </ProjectProvider>
  )
}