import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  InputAdornment,
  Alert,
  Fade,
  CircularProgress,
  IconButton,
  Link as MuiLink,
} from '@mui/material'
import {
  Email as EmailIcon,
  Pin as PinIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useProjects } from '../context/ProjectContext'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

const buttonSx = {
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  fontWeight: 600,
  px: 3,
  py: 1.5,
  borderRadius: 3,
  textTransform: 'none' as const,
  fontSize: '1rem',
  '&:hover': { background: 'rgba(255, 255, 255, 0.25)' },
}

export const OpenModal = ({ handleLogin }: { handleLogin: () => void }) => {
  const { session } = useProjects()
  return (
    <Button
      data-testid="login-button"
      variant="outlined"
      startIcon={session ? <LogoutIcon /> : <LoginIcon />}
      onClick={handleLogin}
      size="large"
      sx={buttonSx}
    >
      {session ? 'Account' : 'Login'}
    </Button>
  )
}

export default function LoginModal({ open, onClose, onSuccess, onError }: LoginModalProps) {
  const { requestOtp, verifyOtp, signOut, session } = useProjects()
  const [phase, setPhase] = useState<'request' | 'verify'>('request')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (open) {
      setPhase('request')
      setEmail('')
      setCode('')
      setLocalError('')
      setLoading(false)
    }
  }, [open])

  const handleClose = () => {
    if (!loading) onClose()
  }

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setLocalError('')
    try {
      await requestOtp(email)
      setPhase('verify')
      onSuccess?.(`Sign-in link & code sent to ${email}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send sign-in email'
      setLocalError(msg)
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setLocalError('Enter the code from the email')
      return
    }
    setLoading(true)
    setLocalError('')
    try {
      await verifyOtp(email, code.trim())
      onSuccess?.('Signed in successfully')
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired code'
      setLocalError(msg)
      onError?.(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      onSuccess?.('Signed out')
      onClose()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
      <Box sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {session ? 'Account' : 'Sign in'}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
          {session ? session.user.email : 'Passwordless sign-in by email (magic link / OTP)'}
        </Typography>
      </Box>

      {session ? (
        <>
          <DialogContent sx={{ p: 4 }}>
            <Typography>You are signed in as <strong>{session.user.email}</strong>.</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleClose} variant="outlined">Close</Button>
            <Button data-testid="login-signout" onClick={handleSignOut} variant="contained" color="error"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LogoutIcon />} disabled={loading}>
              Sign out
            </Button>
          </DialogActions>
        </>
      ) : phase === 'request' ? (
        <form onSubmit={handleRequest}>
          <DialogContent sx={{ p: 4 }}>
            {localError && (
              <Fade in><Alert severity="error" sx={{ mb: 3 }}>{localError}</Alert></Fade>
            )}
            <TextField
              data-testid="login-email"
              name="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              autoFocus
              disabled={loading}
              InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon /></InputAdornment>) }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleClose} variant="outlined" disabled={loading}>Cancel</Button>
            <Button data-testid="login-send" type="submit" variant="contained" disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}>
              Send sign-in email
            </Button>
          </DialogActions>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <DialogContent sx={{ p: 4 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              We emailed a sign-in link &amp; code to <strong>{email}</strong>.
              In dev, open <MuiLink href="http://localhost:9110" target="_blank" rel="noopener">Inbucket</MuiLink>{' '}
              to read it — click the link, or paste the 6-digit code below.
            </Alert>
            {localError && (
              <Fade in><Alert severity="error" sx={{ mb: 3 }}>{localError}</Alert></Fade>
            )}
            <TextField
              data-testid="login-code"
              name="code"
              label="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              autoFocus
              disabled={loading}
              inputProps={{ inputMode: 'numeric', maxLength: 8 }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><PinIcon /></InputAdornment>) }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setPhase('request')} variant="outlined" disabled={loading}>Back</Button>
            <Button data-testid="login-verify" type="submit" variant="contained" disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}>
              Verify &amp; sign in
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  )
}
