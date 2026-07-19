"use client";

interface TableDialogProps {
  open: boolean;
  rows: number;
  cols: number;
  onRowsChange: (value: number) => void;
  onColsChange: (value: number) => void;
  onOk: () => void;
  onCancel: () => void;
}

export default function TableDialog({
  open,
  rows,
  cols,
  onRowsChange,
  onColsChange,
  onOk,
  onCancel,
}: TableDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-72 rounded-lg bg-white shadow-xl border p-5">

        <h2 className="text-lg font-semibold mb-4">
          Insert Table
        </h2>

        <div className="space-y-3">

          <div>
            <label className="block text-sm mb-1">
              Rows
            </label>

            <input
              type="number"
              min={1}
              max={30}
              value={rows}
              onChange={(e) =>
                onRowsChange(Number(e.target.value))
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">
              Columns
            </label>

            <input
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={(e) =>
                onColsChange(Number(e.target.value))
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>

        </div>

        <div className="flex justify-end gap-2 mt-5">

          <button
            onClick={onCancel}
            className="px-3 py-1 rounded border"
          >
            Cancel
          </button>

          <button
            onClick={onOk}
            className="px-3 py-1 rounded bg-blue-600 text-white"
          >
            OK
          </button>

        </div>

      </div>
    </div>
  );
}