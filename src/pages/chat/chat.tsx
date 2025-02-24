import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useEffect, useCallback } from "react";
import { message, ChatSession } from "../../interfaces/interfaces"
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import { ChatSessions } from "@/components/custom/chat-sessions";
import { useNavigate, useParams } from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import { Toast } from '@/components/custom/toast';

interface ChatProps {
  showSidebar: boolean;
}

export function Chat({ showSidebar }: ChatProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean;}>(
    { message: '', type: 'success', isVisible: false }
  );
  
  const navigate = useNavigate();
  const { sessionId } = useParams();

  // URL의 세션 ID와 현재 세션 상태 동기화
  useEffect(() => {
    if (!showSidebar) return;
    
    // 세션이 없고 세션 목록이 있을 때 첫 번째 세션으로 이동
    if (!sessionId && sessions.length > 0) {
      navigate(`/chat/${sessions[0].id}`);
      return;
    }

    // 특정 세션 ID가 있지만 해당 세션이 존재하지 않을 때 /chat으로 리다이렉트
    if (sessionId && !sessions.find(session => session.id === sessionId)) {
      navigate('/chat');
    }
  }, [sessions, sessionId, navigate, showSidebar]);

  // 현재 세션의 메시지 가져오기
  const currentSession = sessions.find(session => session.id === sessionId);
  const currentMessages = showSidebar ? (currentSession?.messages || []) : messages;

  // 새 세션 생성
  const handleCreateSession = async () => {
    const newSessionId = uuidv4();
    try {
      // 서버에 세션 생성 요청
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/create_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: newSessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const result = await response.json();
      
      if (result.success) {
        const newSession: ChatSession = {
          id: newSessionId,
          messages: [],
          createdAt: new Date(),
          title: "New Chat"
        };
        setSessions(prev => [...prev, newSession]);
        navigate(`/chat/${newSession.id}`);
        showToast('새 세션이 생성되었습니다.', 'success');
      } else {
        showToast('새 세션 생성에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      showToast('새 세션 생성에 실패했습니다.', 'error');
    }
  };

  // 토스트 메시지 표시
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  // 세션 삭제
  const handleDeleteSession = async (sessionId: string) => {
    try {
      // DB에서 세션 삭제
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/delete_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      const result = await response.json();
      
      if (result.success) {
        showToast('세션이 성공적으로 삭제되었습니다.', 'success');
        // 클라이언트 상태 업데이트
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        const remainingSessions = sessions.filter(session => session.id !== sessionId);
        if (remainingSessions.length > 0) {
          navigate(`/chat/${remainingSessions[0].id}`);
        } else {
          navigate('/chat');
        }
      } else {
        showToast('세션 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast('세션 삭제에 실패했습니다.', 'error');
    }
  };

  
  // 세션 선택
  const handleSelectSession = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };



async function handleSubmit(text?: string) {
  if (isLoading) return;
  
  const messageText = text || question;
  if (!messageText.trim()) return;

  setIsLoading(true);
  let currentSessionId = sessionId;

  // 세션이 없는 경우 생성
  if (!currentSessionId) {
    try {
      const newSessionId = uuidv4();
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/create_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: newSessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const result = await response.json();
      
      if (result.success) {
        const newSession: ChatSession = {
          id: newSessionId,
          messages: [],
          createdAt: new Date(),
          title: messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText
        };
        setSessions(prev => [...prev, newSession]);
        currentSessionId = newSessionId;
        navigate(`/chat/${newSessionId}`);
      } else {
        showToast('세션 생성에 실패했습니다.', 'error');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      showToast('세션 생성에 실패했습니다.', 'error');
      setIsLoading(false);
      return;
    }
  }

  const traceId = showSidebar ? currentSessionId! : uuidv4();

  // 사용자 메시지 추가
  const userMessage = { content: messageText, role: "user", id: traceId };
  if (showSidebar) {
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, userMessage]
        };
      }
      return session;
    }));
  } else {
    setMessages(prev => [...prev, userMessage]);
  }
  setQuestion("");

  try {
    // API 호출 (프록시 서버를 통해)
    const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/update_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: messageText,
        uuid: traceId
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // 응답 처리
    const result = await response.json();
    const answer = result.answer;
    
    // 응답 메시지 추가
    const assistantMessage = { content: answer, role: "assistant", id: traceId };
    if (showSidebar) {
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, assistantMessage]
          };
        }
        return session;
      }));
    } else {
      setMessages(prev => [...prev, assistantMessage]);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="flex h-dvh bg-background">
      {showSidebar && (
        <div className="w-64 border-r border-border bg-white dark:bg-zinc-900">
          <ChatSessions
            currentSessionId={sessionId || ""}
            onSessionSelect={handleSelectSession}
            onSessionCreate={handleCreateSession}
            onSessionDelete={handleDeleteSession}
            sessions={sessions}
          />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <Header/>
        <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4" ref={messagesContainerRef}>
          {currentMessages.length === 0 && <Overview />}
          {currentMessages.map((message, index) => (
            <PreviewMessage key={index} message={message} />
          ))}
          {isLoading && <ThinkingMessage />}
          <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]"/>
        </div>
        <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <ChatInput  
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
      />
    </div>
  );
};