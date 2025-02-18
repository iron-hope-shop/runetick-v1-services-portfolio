import React, { useState, useRef, useEffect } from 'react';
import {
  Fab,
  Zoom,
  Card,
  CardContent,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Fade,
  Button,
  CircularProgress,
  Avatar,
  Grow,
} from '@mui/material';
import { Chat as ChatIcon, Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import useClickOutside from '../Hooks/useClickOutside';

const API_URL = process.env.SEER_CEREBRO_CHATBOT_URL || 'http://localhost:8000';

const GlassyChatFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleToggleChat = () => setIsOpen(!isOpen);

  const handleSendMessage = async (message = inputMessage) => {
    if (message.trim() !== '' && !isLoading) {
      setIsLoading(true);
      setMessages(prev => [...prev, { text: message, sender: 'user' }]);
      setInputMessage(''); // Clear input field after sending message

      try {
        const response = await fetch(`${API_URL}/ask`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question: message }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setMessages(prev => [...prev, { text: data.answer, sender: 'bot' }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { text: "Sorry, there was an error processing your request.", sender: 'bot' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const suggestions = [
    "What is the most expensive item?",
    "What is the least expensive item?",
    "Highest Volume",
  ];

  const glassyStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: 'none',
  };

  const chatRef = useClickOutside(() => setIsOpen(false));

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 999 }} ref={chatRef}>
      <Zoom in={true}>
        <Fab
          color="primary"
          onClick={handleToggleChat}
          sx={{
            ...glassyStyle,
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          {isOpen ? <CloseIcon style={{ color: 'white' }} /> : <ChatIcon style={{ color: 'white' }} />}
        </Fab>
      </Zoom>

      <Grow
        in={isOpen}
        style={{ transformOrigin: 'bottom right' }}
      >
        <Card
          sx={{
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            position: 'absolute',
            bottom: 80,
            right: 0,
            width: 320,
            height: 496,
            ...glassyStyle,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            p: 2,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'transparent', 
                    mr: 1, 
                    width: 64,  // Set the desired width
                    height: 64,  // Set the desired height
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }} 
                  src={"seer.png"}
                ></Avatar>
                <Typography variant="body1" component="h2" sx={{ color: 'white' }}>
                  Seer
                </Typography>
              </Box>
              <IconButton onClick={handleToggleChat} size="small" sx={{ color: 'white' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' }}>
              <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                {messages.map((message, index) => (
                  <ListItem key={index} sx={{ justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <Box
                      sx={{
                        bgcolor: message.sender === 'user' ? 'grey.500' : 'white',
                        color: message.sender === 'user' ? 'white' : 'black',
                        borderRadius: '12px',
                        px: 2,
                        py: 1,
                        maxWidth: '90%'
                      }}
                    >
                      <ListItemText
                        primary={message.text}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'inherit'
                        }}
                      />
                    </Box>
                  </ListItem>
                ))}
                {isLoading && (
                  <ListItem sx={{ justifyContent: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CircularProgress size={20} sx={{ color: 'white', mr: 2 }} />
                      <Typography variant="body2" sx={{ color: 'white' }}>Let me look into my looking glass.</Typography>
                    </Box>
                  </ListItem>
                )}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            <Box sx={{ height: '40px', mb: 2, overflow: 'hidden' }}>
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  height: '100%',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  'scrollbarWidth': 'none',
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isLoading}
                    sx={{
                      mr: 1,
                      height: '32px',
                      whiteSpace: 'nowrap',
                      color: isLoading ? 'rgba(255, 255, 255, 0.5)' : 'white',
                      borderColor: isLoading ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        borderColor: isLoading ? 'rgba(255, 255, 255, 0.1)' : 'white',
                        background: isLoading ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.3)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      minWidth: 'auto',
                      padding: '4px 8px',
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="How can I help you today?"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
                sx={{
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
};

export default GlassyChatFAB;