import React from 'react'
import { Box, Typography, Paper, Button } from '@mui/material'

type ErrorBoundaryProps = {
  children: React.ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
  error: any
  errorInfo: any
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ff7b7b 0%, #d63384 100%)',
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
            <Typography variant="h4" color="error" gutterBottom sx={{ fontWeight: 700 }}>
              🚨 Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              The application encountered an unexpected error. Please check the console for more details.
            </Typography>
            
            {this.state.error && (
              <Box
                sx={{
                  bgcolor: '#f5f5f5',
                  p: 2,
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  textAlign: 'left',
                  mb: 3,
                  fontSize: '0.875rem',
                  color: 'error.main',
                  overflow: 'auto',
                  maxHeight: 200
                }}
              >
                <div><strong>Error:</strong> {this.state.error.toString()}</div>
                {this.state.errorInfo?.componentStack && (
                  <div><strong>Component Stack:</strong>{this.state.errorInfo.componentStack}</div>
                )}
              </Box>
            )}
            
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      )
    }
    return this.props.children
  }
}