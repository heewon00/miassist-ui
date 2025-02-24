import { motion } from 'framer-motion';
import { cx } from 'classix';
import { SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { message } from "../../interfaces/interfaces"
import { MessageActions } from '@/components/custom/actions';

export const PreviewMessage = ({ message }: { message: message; }) => {

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      data-role={message.role}
    >
      <div
        className={cx(
          'flex gap-4 rounded-xl p-4',
          'group-data-[role=user]/message:bg-white group-data-[role=user]/message:dark:bg-zinc-800 group-data-[role=user]/message:text-zinc-900 group-data-[role=user]/message:dark:text-white',
          'group-data-[role=user]/message:border group-data-[role=user]/message:border-zinc-200 group-data-[role=user]/message:dark:border-zinc-800',
          'group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
          'group-data-[role=assistant]/message:bg-white group-data-[role=assistant]/message:dark:bg-zinc-900 group-data-[role=assistant]/message:w-full',
          'group-data-[role=assistant]/message:text-zinc-900 group-data-[role=assistant]/message:dark:text-white'
        )}
      >
        {message.role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col w-full">
          {message.content && (
            <div className="flex flex-col gap-4 text-left">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {message.role === 'assistant' && (
            <MessageActions message={message} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
      data-role={role}
    >
      <div className="flex gap-4 p-4">
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            MIASSIST가 질문을 생성 중입니다. 잠시만 기다려 주세요...
            <span className="inline-block">
              <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
