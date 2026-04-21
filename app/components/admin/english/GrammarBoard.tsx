"use client";

export default function GrammarBoard() {
  return (
    <div className="w-full h-full p-4 overflow-auto">
      <h2 className="text-lg font-semibold mb-4">Grammar Board</h2>

      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Structure</th>
            <th className="border p-2">Example</th>
            <th className="border p-2">Hindi</th>
          </tr>
        </thead>

        <tbody>
          <tr className="text-center">
            <td className="border p-2">I</td>
            <td className="border p-2">am + verb</td>
            <td className="border p-2">I am going</td>
            <td className="border p-2">मैं जा रहा हूँ</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}