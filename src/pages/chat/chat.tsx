import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useEffect, useCallback } from "react";
import { message, ChatSession } from "../../interfaces/interfaces"
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
// import { ChatSessions } from "@/components/custom/chat-sessions";
import { useNavigate, useParams } from 'react-router-dom';
import {v4 as uuidv4} from 'uuid';
import { Toast } from '@/components/custom/toast';
import { Sidebar } from '@/components/custom/sidebar';
import { SidebarToggle } from '@/components/custom/sidebar-toggle';
import { cn } from '@/lib/utils';

interface ChatProps {
  showSidebar: boolean;
}

export function Chat({ showSidebar }: ChatProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [session_info, setSessionInfo] = useState<Array<Record<string, string>>>([]);
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean;}>(
    { message: '', type: 'success', isVisible: false }
  );
  
  const navigate = useNavigate();
  const { sessionId } = useParams();

  // 🔥세션 목록 가져오기
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/read_all_sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const result = await response.json();
        const newSessionInfo = result.session_info;
        setSessionInfo(newSessionInfo);

        // Convert session_info to ChatSession format
        const formattedSessions = newSessionInfo.map((sessionItem: Record<string, string>) => {
          const [[title, id]] = Object.entries(sessionItem);
          return {
            id,
            title,
            messages: []
          };
        });

        setSessions(formattedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        showToast('세션 목록을 불러오는데 실패했습니다.', 'error');
      }
    };

    fetchSessions();
  }, []);

  // 🔥URL의 세션 ID와 현재 세션 상태 동기화
  useEffect(() => {
    if (!showSidebar) return;

    // 특정 세션 ID가 있지만 해당 세션이 존재하지 않을 때 /chat으로 리다이렉트
    if (sessionId && !sessions.find(session => session.id === sessionId)) {
      navigate('/chat');
    }
  }, [sessions, sessionId, navigate, showSidebar]);

  // 🔥현재 세션의 메시지 가져오기
  // 현재 세션 찾기 (세션 정보도 함께 저장)
  const currentSession = sessions.find(session => {
    const sessionInfo = session_info.find(info => Object.values(info)[0] === session.id);
    return session.id === sessionId && sessionInfo;
  });
  const currentMessages = showSidebar ? (currentSession?.messages || []) : messages;

  // 🔥새 세션 생성
  const handleCreateSession = async () => {
    const newSessionId = uuidv4();
    const newSessionName = 'New Chat'
    try {
      // 서버에 세션 생성 요청
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/create_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: newSessionId, session_name: newSessionName })
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
          title: newSessionName
        };

        // 세션 상태 업데이트를 동기적으로 처리
        await Promise.all([
          new Promise<void>(resolve => {
            setSessions(prev => {
              resolve();
              return [newSession, ...prev];
            });
          }),
          new Promise<void>(resolve => {
            setSessionInfo(prev => {
              resolve();
              return [{ [newSessionName]: newSessionId }, ...prev];
            });
          })
        ]);

        setMessages([]);
        await navigate(`/chat/${newSessionId}`, { replace: true });
        showToast('새 세션이 생성되었습니다.', 'success');
      } else {
        showToast('새 세션 생성에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      showToast('새 세션 생성에 실패했습니다.', 'error');
    }
  };

  // 🔥토스트 메시지 표시
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  // 🔥세션 이름 업데이트
  const handleUpdateSessionName = async (sessionId: string, newName: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/update_session_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId, session_name: newName })
      });

      if (!response.ok) {
        throw new Error('Failed to update session name');
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === sessionId
              ? { ...session, title: newName }
              : session
          )
        );
        setSessionInfo(prevInfo =>
          prevInfo.map(info => {
            const [[, id]] = Object.entries(info);
            if (id === sessionId) {
              return { [newName]: id };
            }
            return info;
          })
        );
        showToast('세션 이름이 업데이트되었습니다.', 'success');
      } else {
        showToast('세션 이름 업데이트에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Error updating session name:', error);
      showToast('세션 이름 업데이트에 실패했습니다.', 'error');
    }
  };

  // 🔥세션 삭제
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

  
  // 🔥특정 세션 클릭 시 메시지 불러오기
  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/read_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('메시지 불러오기 실패');
      }

      const result = await response.json();
      
      // 메시지 포맷 변환
      const formattedMessages = result.messages.map((msg: { type: string; content: string }) => {
        // human -> user로 변환하여 오른쪽에 표시
        const role = msg.type === 'human' ? 'user' : 'assistant';
        return {
          role: role,
          content: msg.content,
          id: uuidv4()
        };
      });

      // 새 세션이고 사용자의 첫 메시지가 있다면 세션 이름 업데이트
      if (result.messages.length === 1 && result.messages[0].type === 'human') {
        const firstMessage = result.messages[0].content;
        const sessionName = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        await handleUpdateSessionName(sessionId, sessionName);
      }

      // 현재 세션의 메시지 업데이트
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, messages: formattedMessages }
            : session
        )
      );
    } catch (error) {
      console.error('메시지 불러오기 오류:', error);
      showToast('대화 내용을 불러오는데 실패했습니다.', 'error');
    }
  };

  // 🔥세션 선택
  const handleSelectSession = async (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
    await fetchSessionMessages(sessionId);
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
      const newSessionName = 'New Chat'
      const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/create_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: newSessionId, session_name: newSessionName })
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const result = await response.json();
      
      if (result.success) {
        const sessionName = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        const newSession: ChatSession = {
          id: newSessionId,
          messages: [],
          createdAt: new Date(),
          title: sessionName
        };

        // 세션 상태 업데이트를 동기적으로 처리
        await Promise.all([
          new Promise<void>(resolve => {
            setSessions(prev => {
              resolve();
              return [newSession, ...prev];
            });
          }),
          new Promise<void>(resolve => {
            setSessionInfo(prev => {
              resolve();
              return [{ [sessionName]: newSessionId }, ...prev];
            });
          })
        ]);

        // 세션 이름 업데이트 API 호출
        await handleUpdateSessionName(newSessionId, sessionName);

        currentSessionId = newSessionId;
        await navigate(`/chat/${newSessionId}`, { replace: true });
        setMessages([]);  // 새 세션의 메시지 초기화
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

  // 🔥사용자 메시지 추가
  const userMessage = { content: messageText, role: "user", id: traceId };
  
  if (showSidebar) {
    // 현재 세션 찾기
    const currentSession = sessions.find(session => session.id === currentSessionId);
    
    // 새로운 세션이고 첫 메시지라면 세션 이름 먼저 업데이트
    if (currentSession && currentSession.messages.length === 0) {
      const sessionName = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
      await handleUpdateSessionName(currentSessionId, sessionName);
    }

    // 메시지 추가
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

  // 🔥실시간 메세지 업데이트
  try {
    // Fetch API를 사용한 스트리밍 응답 처리
    const response = await fetch(`${import.meta.env.VITE_PROXY_URL}/get_answer_stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: messageText,
        session_id: traceId
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Reader not available');

    let isFirstToken = true;
    let accumulatedContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // 스트리밍이 완료되면 토스트 메시지 표시
        showToast('답변을 완료했습니다.', 'success');
        break;
      } 

      // 새로운 텍스트 조각을 디코딩
      const token = new TextDecoder().decode(value);
      accumulatedContent += token;
      
      // 첫 번째 토큰이 도착하면 로딩 상태를 false로 설정
      if (isFirstToken) {
        setIsLoading(false);
        isFirstToken = false;

        // 첫 번째 토큰이 도착했을 때만 메시지 추가
        if (showSidebar) {
          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
              return {
                ...session,
                messages: [...session.messages, { content: accumulatedContent, role: "assistant", id: traceId }]
              };
            }
            return session;
          }));
        } else {
          setMessages(prev => [...prev, { content: accumulatedContent, role: "assistant", id: traceId }]);
        }
      } else {
        // 이후 토큰들은 콘텐츠 업데이트
        if (showSidebar) {
          setSessions(prev => prev.map(session => {
            if (session.id === currentSessionId) {
              const lastMessage = session.messages[session.messages.length - 1];
              return {
                ...session,
                messages: [
                  ...session.messages.slice(0, -1),
                  { ...lastMessage, content: accumulatedContent }
                ]
              };
            }
            return session;
          }));
        } else {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: accumulatedContent }
            ];
          });
        }
      }
    }


    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error("Error:", error);
    showToast('답변을 실패했습니다.', 'error');
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="flex h-dvh bg-background">
      <SidebarToggle
        isOpen={isSidebarOpen}
        onClick={() => setIsSidebarOpen(true)}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(!isSidebarOpen)}
        onDeleteChat={handleDeleteSession}
        sessions={sessions}
        currentSessionId={sessionId || ''}
        onSessionSelect={handleSelectSession}
        onSessionCreate={handleCreateSession}
        onSessionNameUpdate={handleUpdateSessionName}
      />
      
      <div className={cn("flex flex-col flex-1 min-w-0 transition-all duration-200 relative", {
        "ml-64": isSidebarOpen
      })}>
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