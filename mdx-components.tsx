import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2
        className="font-display font-semibold text-xl md:text-2xl text-[var(--color-text)] mt-8 mb-3 first:mt-0 flex items-center gap-2 tracking-tight"
        {...props}
      />
    ),
    blockquote: (props) => (
      <blockquote
        className="font-serif-quote text-lg text-[var(--color-muted)] border-l-2 border-[var(--color-signal-amber)] pl-4 my-4"
        {...props}
      />
    ),
    p: (props) => (
      <p className="text-[15px] leading-7 text-[var(--color-text)]/90 mb-3" {...props} />
    ),
    ul: (props) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-[15px]" {...props} />,
    ol: (props) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-[15px]" {...props} />,
    li: (props) => <li className="marker:text-[var(--color-signal-amber)]" {...props} />,
    strong: (props) => <strong className="text-[var(--color-signal-amber)] font-semibold" {...props} />,
    table: (props) => (
      <div className="overflow-x-auto my-4 blueprint-frame rounded-md">
        <table className="w-full text-sm font-mono-tech" {...props} />
      </div>
    ),
    thead: (props) => (
      <thead
        className="text-[11px] uppercase tracking-widest text-[var(--color-muted)] border-b border-[var(--color-hairline)]"
        {...props}
      />
    ),
    th: (props) => <th className="text-left px-3 py-2" {...props} />,
    td: (props) => <td className="px-3 py-2 border-t border-[var(--color-hairline)]/60" {...props} />,
    code: (props) => (
      <code
        className="font-mono-tech text-[var(--color-signal-amber)] bg-[var(--color-panel-raised)] px-1 py-0.5 rounded text-[13px]"
        {...props}
      />
    ),
    ...components,
  };
}
