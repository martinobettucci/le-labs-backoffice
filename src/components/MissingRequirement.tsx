import { Box, Button, Typography } from '@mui/material'

export default function MissingRequirement() {
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
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              p: 6,
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              textAlign: 'center',
              maxWidth: 500
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
              🔐 Setup Required
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.6 }}>
              Connect your Supabase database to get started with the admin dashboard.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Connect to Supabase
            </Button>
          </Box>
        </Box>
      )
}