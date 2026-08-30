import { Form, Link } from "react-router";

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  editHref,
  emptyLabel = "Nothing here yet.",
}: {
  rows: T[];
  columns: Column<T>[];
  editHref: (row: T) => string;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">{emptyLabel}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-900">
          <tr>
            {columns.map((c) => (
              <th key={c.header} className="px-4 py-2 font-medium">
                {c.header}
              </th>
            ))}
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-100 last:border-0 dark:border-gray-900"
            >
              {columns.map((c) => (
                <td key={c.header} className="px-4 py-2">
                  {c.cell(row)}
                </td>
              ))}
              <td className="px-4 py-2 text-right whitespace-nowrap">
                <Link
                  to={editHref(row)}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Edit
                </Link>
                <Form
                  method="post"
                  className="ml-3 inline"
                  onSubmit={(e) => {
                    if (!confirm("Delete this item?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={row.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete
                  </button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
