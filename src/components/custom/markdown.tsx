import { memo, ReactNode, ComponentProps as ReactProps, ComponentType } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

type MarkdownComponentProps = ReactProps<ComponentType> & {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}

const NonMemoizedMarkdown: React.FC<{ children: string }> = ({ children }) => {
  const components = {
    table: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-700" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <thead className="bg-zinc-100 dark:bg-zinc-800" {...props}>
          {children}
        </thead>
      );
    },
    th: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <th 
          className="px-4 py-2 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
          {...props}
        >
          {children}
        </th>
      );
    },
    td: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <td 
          className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
          {...props}
        >
          {children}
        </td>
      );
    },
    tr: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <tr 
          className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
          {...props}
        >
          {children}
        </tr>
      );
    },
    code: ({ inline, className, children, ...props }: MarkdownComponentProps & { inline?: boolean }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="relative group my-4">
          <div className="absolute flex items-center gap-2 left-4 top-0 transform -translate-y-1/2 z-10">
            <div className="px-3 py-1 text-xs font-medium bg-white dark:bg-[#282c34] text-zinc-600 dark:text-zinc-400 rounded-full border border-zinc-200 dark:border-zinc-700/50 shadow-sm">
              {match[1]}
            </div>
          </div>
          <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ""))}
              className="px-2 py-1 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700/50 dark:hover:bg-zinc-600/50 rounded transition-colors shadow-sm"
            >
              Copy
            </button>
          </div>
          <div className="w-full overflow-hidden">
            <div className="max-w-full overflow-x-auto">
              <SyntaxHighlighter
                {...props}
                style={{
                  ...(typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? oneDark : oneLight),
                  'pre[class*="language-"]': {
                    background: 'transparent',
                    margin: 0,
                    padding: 0,
                  },
                  'code[class*="language-"]': {
                    background: 'transparent',
                  },
                }}
                language={match[1]}
                PreTag="div"
                className="rounded-lg !my-0 !bg-zinc-50 dark:!bg-[#282c34] border border-zinc-200 dark:border-zinc-700/50"
                wrapLines={true}
                wrapLongLines={true}
                customStyle={{
                  margin: 0,
                  marginTop: '0.75rem',
                  padding: '1.5rem 1rem 1rem',
                  fontSize: '0.875rem',
                  background: 'transparent',
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-2 rounded-md font-mono`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <a
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ children, ...props }: MarkdownComponentProps) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
  };

  return (
    <div className="w-full break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        className="w-full overflow-hidden"
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
