import { useState, useEffect, useRef } from 'react';
import axiosInstance from './axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/chat/conversations');
      if (response.data?.success) {
        const fetchedData = response.data.messages || response.data.data || [];
        setConversations(Array.isArray(fetchedData) ? fetchedData : []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const handleSendMessage = async (question) => {
    if (!question.trim()) return;

    // 1. Gaaffii User-a battalatti UI irratti agarsiisuu
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };

    setConversations((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/chat/conversations', {
        question,
      });

      if (response.data?.success) {
        // 2. Backend irraa messages guutuu yoo deebi'e
        if (Array.isArray(response.data.messages)) {
          setConversations(response.data.messages);
        } else if (response.data.reply) {
          // Yoo single reply qofa deebi'e AI message itti dabaluu
          const tempAssistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: response.data.reply,
          };
          setConversations((prev) => [...prev, tempAssistantMessage]);
        }
      }
    } catch (error) {
      console.error('Error posting message:', error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Error uumameera, irra deebii yaali.';

      const errorConversation = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
      };

      setConversations((prev) => [...prev, errorConversation]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='app'>
      <Sidebar />

      <main className='chat'>
        <ChatHeader />

        {/* Prop name 'conversations' ta'uu eeggadhu */}
        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;