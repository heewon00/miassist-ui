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
      <div
        className={cx(
          'flex gap-4 rounded-xl p-4',
          'bg-white dark:bg-zinc-900 w-full',
          'border border-zinc-200 dark:border-zinc-800'
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">
            MIASSIST가 질문을 생성 중입니다. 잠시만 기다려 주세요...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
