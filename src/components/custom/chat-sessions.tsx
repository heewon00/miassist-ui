import { useState } from 'react';
import { Button } from '../ui/button';
import { ChatSession } from '@/interfaces/interfaces';
import { TrashIcon } from './icons';
import { cx } from 'classix';
import { ConfirmDialog } from './confirm-dialog';

interface ChatSessionsProps {
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onSessionCreate: () => void;
  onSessionDelete: (sessionId: string) => void;
  sessions: ChatSession[];
}

export const ChatSessions = ({
  currentSessionId,
  onSessionSelect,
  onSessionCreate,
  onSessionDelete,
  sessions
}: ChatSessionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2 px-2">
        <Button
          onClick={onSessionCreate}
          className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white"
          variant="ghost"
        >
          + New Chat
        </Button>
      </div>
      
      <div className="flex flex-col gap-1">
        {sessions.length === 0 ? (
          <div className="text-sm text-muted-foreground italic px-4 py-2">
            No chats.
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={cx(
                'flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer group',
                currentSessionId === session.id
                  ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-700/10 text-zinc-900 dark:text-white'
              )}
              onClick={() => onSessionSelect(session.id)}
            >
              <span className="text-sm truncate">
                {session.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setSessionToDelete(session.id);
                  setDeleteDialogOpen(true);
                }}
              >
                <TrashIcon size={14} />
              </Button>
            </div>
          ))
        )}
      </div>
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSessionToDelete(null);
        }}
        onConfirm={() => {
          if (sessionToDelete) {
            onSessionDelete(sessionToDelete);
          }
          setDeleteDialogOpen(false);
          setSessionToDelete(null);
        }}
        title="세션 삭제"
        description="정말 이 세션을 삭제하시겠습니까?"
      />
    </div>
  );
};
