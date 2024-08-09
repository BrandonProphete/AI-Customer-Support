'use client'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import './i18n';

export default function Home() {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Old Navy live support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)

    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      backgroundColor="var(--background-end-rgb)"
    >
       <Typography variant="h2" style={{ marginTop: '-20px' }}>{t('title')}</Typography>

      <Box className="phone-frame">
        <Stack
          direction={'column'}
          className="chat-container"
          p={2}
          spacing={3}
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant'
                      ? 'primary.main'
                      : 'secondary.main'
                  }
                  color="white"
                  borderRadius={16}
                  p={3}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              InputProps={{
                style: {
                  color: 'black', /* Dark text color for light background */
                  backgroundColor: 'white', /* Light background color */
                }, // Ensure text and background are visible
              }}
              InputLabelProps={{
                style: { color: 'black' }, // Ensure label is visible
              }}
            />
            <Button 
              variant="contained" 
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <div className="absolute top-4 right-4 flex space-x-2 z-10"><button
          onClick={() => i18n.changeLanguage('nl')}
          title="Spainish"
          className="p-2 bg-yellow-200 rounded-full shadow-md hover:bg-yellow-300 transition duration-300"
        >
          <img src="/flags/nl.svg" alt="Spainish" style={{width: '200px', height: '150px', top: '50%', left: '50%'}} />
        </button>

        <button
          onClick={() => i18n.changeLanguage('en')}
          title="English"
          className="p-2 bg-red-200 rounded-full shadow-md hover:bg-red-300 transition duration-300"
        >
          <img src="/flags/En.svg" alt="English" style={{width: '200px', height: '150px', top: '50%', left: '50%', gap: 3}}  />
        </button>
        </div>
    </Box>
  )
}
