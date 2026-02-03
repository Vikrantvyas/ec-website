import Link from "next/link";
import { branches } from "../data/institute";

export default function BranchesSection() {
  return (
    <section className="py-8 px-4 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        Our Branches in Indore
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {branches.map((branch) => (
          <Link
            key={branch.slug}
            href={branch.slug}
            className="flex items-center gap-4 border rounded-xl p-3 hover:bg-gray-50 transition"
          >
            {/* Branch Image (small & controlled) */}
            <img
              src={`/home/branches/${branch.slug.replace("/", "")}.jpg`}
              alt={`${branch.name} branch`}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />

            {/* Branch Info */}
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-800">
                {branch.name}
              </p>
              <p className="text-sm text-gray-500">
                Spoken English & Communication
              </p>
            </div>

            {/* Arrow */}
            <span className="text-blue-600 text-sm font-medium">
              View →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
