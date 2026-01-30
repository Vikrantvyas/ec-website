import Link from "next/link";
import { branches } from "../data/institute";

export default function BranchesSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
        Our Branches in Indore
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {branches.map((branch) => (
          <Link
            key={branch.slug}
            href={branch.slug}
            className="group flex items-center justify-between border border-gray-200 rounded-2xl p-5 bg-white hover:bg-gray-50 transition"
          >
            <span className="text-lg font-medium text-gray-900">
              {branch.name}
            </span>

            <span className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition">
              View Branch →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
