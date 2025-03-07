import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteChat?: (chatId: string) => void;
  sessions?: Array<{ id: string; title: string; }>;
  currentSessionId?: string;
  onSessionSelect?: (sessionId: string) => void;
  onSessionCreate?: () => void;
  onSessionNameUpdate?: (sessionId: string, newName: string) => void;
}

interface EditableSessionProps {
  id: string;
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
  isCurrentSession: boolean;
  onClick: () => void;
}

function EditableSession({ title, isEditing, onSave, onCancel, isCurrentSession, onClick }: EditableSessionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState(title);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setCurrentValue(title);
  }, [title]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave(currentValue);
    } else if (e.key === 'Escape') {
      setCurrentValue(title);
      onCancel();
    }
  };

  const handleBlur = () => {
    if (currentValue !== title) {
      onSave(currentValue);
    } else {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-[180px]">
        {isEditing ? (
          <div className="w-[180px]">
            <input
              ref={inputRef}
              type="text"
              value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
              className="w-[180px] h-10 px-3 py-2 bg-transparent border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
          </div>
        ) : (
          <div className="w-[180px]">
            <Button
              variant={isCurrentSession ? "secondary" : "ghost"}
              className={cn("w-[180px] justify-start gap-2 h-10 dark:hover:bg-[#2A2E35]", {
                "bg-gray-200 hover:bg-gray-300 dark:bg-[#2A2E35] dark:hover:bg-[#353A43]": isCurrentSession,
                "hover:bg-gray-100 dark:hover:bg-[#2A2E35]": !isCurrentSession
              })}
              onClick={onClick}
            >
              <span className="truncate">{title}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({
  isOpen,
  onClose,
  onDeleteChat,
  sessions = [],
  currentSessionId = '',
  onSessionSelect,
  onSessionCreate,
  onSessionNameUpdate
}: SidebarProps) {






  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 w-65 bg-gray-50 dark:bg-[#1E2126] border-r dark:border-[#2A2E35] transform transition-transform duration-200 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center mb-4 px-2">
          <h2 className="text-lg font-semibold flex-1">Chats</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          onClick={onSessionCreate}
          className="mb-4 flex items-center gap-2"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>

        <ScrollArea className="flex-1">
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="group px-2">
                <div className="flex items-center w-full gap-2">
                  <EditableSession
                    id={session.id}
                    title={session.title}
                    isEditing={editingSessionId === session.id}
                    onEdit={() => setEditingSessionId(session.id)}
                    onSave={(newTitle) => {
                      onSessionNameUpdate?.(session.id, newTitle);
                      setEditingSessionId(null);
                    }}
                    onCancel={() => setEditingSessionId(null)}
                    isCurrentSession={session.id === currentSessionId}
                    onClick={() => onSessionSelect?.(session.id)}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(session.id);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>이름 바꾸기</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteChat(e, session.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>삭제</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
