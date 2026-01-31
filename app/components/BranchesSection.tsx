import Link from "next/link";
import { branches } from "../data/institute";

export default function BranchesSection() {
  return (
    <section className="py-6 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        Our Branches in Indore
      </h2>

      <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-3">
        {branches.map((branch) => (
          <Link
            key={branch.slug}
            href={branch.slug}
            className="border rounded-xl overflow-hidden hover:shadow-md transition bg-white"
          >
            {/* Branch Image */}
            <div className="h-40 w-full overflow-hidden">
              <img
                src={`/home/branch-${branch.slug.replace("/", "")}.jpg`}
                alt={`${branch.name} English Club`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Branch Info */}
            <div className="p-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">
                {branch.name}
              </span>
              <span className="text-blue-600 text-sm">
                View Branch →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
