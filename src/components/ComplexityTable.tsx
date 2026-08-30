export function ComplexityTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto my-4 blueprint-frame rounded-md not-prose">
      <table className="w-full text-sm font-mono-tech">
        <thead className="text-[11px] uppercase tracking-widest text-[var(--color-muted)] border-b border-[var(--color-hairline)]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-t border-[var(--color-hairline)]/60">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
