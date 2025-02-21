import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from '@/components/custom/use-scroll-to-bottom';
import { useState, useRef } from "react";
import { message } from "../../interfaces/interfaces"
import { Overview } from "@/components/custom/overview";
import { Header } from "@/components/custom/header";
import {v4 as uuidv4} from 'uuid';

export function Chat() {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [messages, setMessages] = useState<message[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);



async function handleSubmit(text?: string) {
  if (isLoading) return;

  const messageText = text || question;
  if (!messageText.trim()) return;

  setIsLoading(true);
  const traceId = uuidv4();

  // 사용자 메시지 추가
  setMessages(prev => [...prev, { content: messageText, role: "user", id: traceId }]);
  setQuestion("");

  try {
    // API 호출 (프록시 서버를 통해)
    const response = await fetch(import.meta.env.VITE_PROXY_URL, {
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
    const answer = await response.text();
    
    // 응답 메시지 추가
    setMessages(prev => [...prev, { content: answer, role: "assistant", id: traceId }]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
}

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <Header/>
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4" ref={messagesContainerRef}>
        {messages.length == 0 && <Overview />}
        {messages.map((message, index) => (
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
  );
};