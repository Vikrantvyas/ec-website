import Link from "next/link";
import { branches } from "../data/institute";

export default function BranchesSection() {
  return (
    <section className="py-8 px-4 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        Our Branches in Indore
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">
        {branches.map((branch) => {
          let imagePath = "";
          let badges: string[] = [];

          if (branch.slug === "/nanda-nagar") {
            imagePath = "/home/branch-nanda-nagar.jpg";
            badges = ["English", "Computer"];
          } else if (branch.slug === "/bapat-square") {
            imagePath = "/home/branch-bapat-square.jpg";
            badges = ["English"];
          } else if (branch.slug === "/aurobindo-hospital") {
            imagePath = "/home/branch-aurobindo-hospital.jpg";
            badges = ["Computer"];
          }

          return (
            <Link
              key={branch.slug}
              href={branch.slug}
              className="flex items-center gap-4 border rounded-xl p-3 hover:bg-gray-50 transition"
            >
              {/* Branch Image */}
              <img
                src={imagePath}
                alt={`${branch.name} branch`}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />

              {/* Branch Info */}
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-800">
                  {branch.name}
                </p>

                <div className="flex gap-2 mt-1 flex-wrap">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        badge === "English"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <span className="text-blue-600 text-sm font-medium">
                View →
              </span>
            </Link>
          );
        })}

        {/* ONLINE OPTION */}
        <div className="pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Online Option
          </h3>

          <Link
            href="/online-english"
            className="flex items-center gap-4 border rounded-xl p-3 hover:bg-gray-50 transition"
          >
            {/* Zoom Image */}
            <img
              src="/home/online-zoom.jpg"
              alt="Online English Zoom Class"
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />

            {/* Online Info */}
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-800">
                Online English
              </p>

              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                English
              </span>
            </div>

            <span className="text-green-600 text-sm font-medium">
              Join →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
