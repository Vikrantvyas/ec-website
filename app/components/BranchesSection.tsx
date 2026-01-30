import Link from "next/link";
import { branches } from "../data/institute";

export default function BranchesSection() {
  return (
    <section className="py-6 px-4">
      <h2 className="text-2xl font-bold text-center mb-4">
        Our Branches in Indore
      </h2>

      <div className="max-w-4xl mx-auto grid gap-4">
        {branches.map((branch) => (
          <Link
            key={branch.slug}
            href={branch.slug}
            className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50 transition"
          >
            <span className="text-lg font-medium">
              {branch.name}
            </span>

            <span className="text-blue-600 text-sm">
              View Branch →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
