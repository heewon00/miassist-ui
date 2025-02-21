import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    table: ({ node, children, ...props }: any) => {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-zinc-200 dark:border-zinc-700" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead: ({ node, children, ...props }: any) => {
      return (
        <thead className="bg-zinc-100 dark:bg-zinc-800" {...props}>
          {children}
        </thead>
      );
    },
    th: ({ node, children, ...props }: any) => {
      return (
        <th 
          className="px-4 py-2 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
          {...props}
        >
          {children}
        </th>
      );
    },
    td: ({ node, children, ...props }: any) => {
      return (
        <td 
          className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
          {...props}
        >
          {children}
        </td>
      );
    },
    tr: ({ node, children, ...props }: any) => {
      return (
        <tr 
          className="hover:bg-zinc-50 dark:hover:bg-zinc-900"
          {...props}
        >
          {children}
        </tr>
      );
    },
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <pre
          {...props}
          className={`${className} text-sm w-full overflow-x-auto bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg my-4 shadow-sm`}
        >
          <code className={`language-${match[1]} block`}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-2 rounded-md font-mono`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }: any) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },
    a: ({ node, children, ...props }: any) => {
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
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }: any) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }: any) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }: any) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }: any) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
