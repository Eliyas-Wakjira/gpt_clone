import { useState, useEffect, useRef } from 'react';
import axiosInstance from './axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import AuthModal from './components/AuthModal/AuthModal';
import './App.css';

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchConversations();
    } else {
      setIsAuthOpen(true);
    }
  }, [token]);

  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/chat/conversations');
      if (response.data?.success) {
        setConversations(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Status 401 ykn 403 yoo dhufe token moofaa dhabamsiisiitii login modal bani
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setIsAuthOpen(true);
      }
    }
  };

  const handleSendMessage = async (question) => {
    if (!question.trim()) return;

    if (!localStorage.getItem('token')) {
      setIsAuthOpen(true);
      return;
    }

    const tempUserMessage = { id: Date.now(), role: 'user', content: question };
    setConversations((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/chat/conversations', { question });
      if (response.data?.success) {
        setConversations(response.data.messages);
      }
    } catch (error) {
      console.error('Error posting message:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        setIsAuthOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='app'>
      <Sidebar />
      <main className='chat'>
        <ChatHeader />
        <MessageList conversations={conversations} isLoading={isLoading} messagesEndRef={messagesEndRef} />
        <ChatInput handleSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default App;