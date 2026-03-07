"use client";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function FormBlock({ title, children }: Props) {

  return (

    <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">

      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {children}

      </div>

    </div>

  );

}