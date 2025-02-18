import React, { useState } from 'react';
import { Box, Button, Modal, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import YouTube from 'react-youtube';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 600,
  bgcolor: '#121212',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '4px',
  boxShadow: 24,
  p: 4,
  color: 'white',
};

const steps = [
  {
    title: "Welcome to Runetick",
    description: "Let's get you started with the basics of our app.",
    videoId: "VIDEO_ID_1" // Replace with your actual YouTube video ID
  },
  {
    title: "Exploring Item Prices",
    description: "Learn how to search and analyze item prices.",
    videoId: "VIDEO_ID_2" // Replace with your actual YouTube video ID
  },
  {
    title: "Managing Your Watchlist",
    description: "We'll guide you through creating and managing your watchlist.",
    videoId: "VIDEO_ID_3" // Replace with your actual YouTube video ID
  }
];

const OnboardingModal = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="onboarding-modal-title"
      aria-describedby="onboarding-modal-description"
    >
      <Box sx={modalStyle}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="onboarding-modal-title" variant="h6" component="h2" gutterBottom>
          {steps[currentStep].title}
        </Typography>
        <Typography id="onboarding-modal-description" sx={{ mt: 2, mb: 2 }}>
          {steps[currentStep].description}
        </Typography>
        <Box sx={{ width: '100%', height: 315, mb: 2 }}>
          <YouTube
            videoId={steps[currentStep].videoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0,
              },
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
            sx={{ color: 'white' }}
          >
            Previous
          </Button>
          <Button 
            onClick={handleNext}
            variant="contained"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default OnboardingModal;