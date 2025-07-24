import React, { useState } from 'react'
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  Typography, 
  InputAdornment,
  IconButton,
  Alert,
  Fade,
  CircularProgress
} from '@mui/material'
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useProjects } from '../context/ProjectContext'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

interface LoginFormData {
  email: string
  password: string
}

const emptyLoginForm: LoginFormData = {
  email: '',
  password: ''
}

export const OpenModal = ({ handleLogin }: { handleLogin: () => void }) => {
  const { session } = useProjects()
  return (
    <Button
    variant="outlined"
    startIcon={<LoginIcon />}
    onClick={handleLogin}
    size="large"
    sx={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: 'white',
      fontWeight: 600,
      px: 3,
      py: 1.5,
      borderRadius: 3,
      textTransform: 'none',
      fontSize: '1rem',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-1px)',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}
  >
    {session ? 'Log Out' : 'Login'}
  </Button>
  )
}

export default function LoginModal({ open, onClose, onSuccess, onError }: LoginModalProps) {
  const { signInWithEmail, signOut, session } = useProjects()
  const [form, setForm] = useState<LoginFormData>(emptyLoginForm)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})
  const [localError, setLocalError] = useState('')

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setForm(emptyLoginForm)
      setErrors({})
      setLocalError('')
      setShowPassword(false)
    }
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear errors when user starts typing
    if (errors[name as keyof LoginFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    if (localError) {
      setLocalError('')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}
    
    // Email validation
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (session) {
      await signOut()
      return
    }
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setLocalError('')

    try {
      // Use Supabase authentication from ProjectContext
      await signInWithEmail(form.email, form.password)
      
      if (onSuccess) {
        onSuccess(`Welcome back, ${form.email}!`)
      }
      
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.'
      setLocalError(errorMessage)
      
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with gradient background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background pattern */}
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
        
        <Box sx={{ position: 'relative', zIndex: 1, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LoginIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: 'white',
                    mb: 0.5,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {session ? 'Sign Out' : 'Sign In'}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 400
                  }}
                >
                  {session ? '' : 'Access your account'}
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.3)'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        {session ? (
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1">
              You are currently signed in as {session.user.email}
            </Typography>
          </DialogContent>
        ): (
        <DialogContent sx={{ p: 4 }}>
          {localError && (
            <Fade in>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  fontWeight: 500
                }}
              >
                {localError}
              </Alert>
            </Fade>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              name="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      disabled={loading}
                      edge="end"
                      sx={{ color: 'action.active' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          </Box>
        </DialogContent>)}

        <DialogActions sx={{ p: 4, pt: 0 }}>
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              variant="outlined"
              size="large"
              sx={{
                flex: 1,
                borderRadius: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                border: '2px solid',
                borderColor: 'grey.300',
                '&:hover': {
                  borderColor: 'grey.400',
                  background: 'grey.50'
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              size="large"
              sx={{
                flex: 1,
                borderRadius: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)'
                },
                '&:disabled': {
                  background: 'grey.300',
                  transform: 'none',
                  boxShadow: 'none'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              startIcon={
                loading ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : (
                  <LoginIcon />
                )
              }
            >
              {session ? 'Sign Out' : loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
} 