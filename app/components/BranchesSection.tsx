import Link from "next/link";
import { branches } from "../data/institute";

export default function BranchesSection() {
  return (
    <section className="py-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        Our Branches in Indore
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        {branches.map((branch) => (
          <Link
            key={branch.slug}
            href={branch.slug}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold">{branch.name}</h3>
            <p className="text-sm text-gray-600">{branch.address}</p>
            <span className="text-blue-600 text-sm mt-2 inline-block">
              View Branch →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
