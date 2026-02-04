import Link from "next/link";
import { branches } from "../data/institute";
import { FaMapMarkerAlt, FaGlobe, FaLaptop, FaMicrophone } from "react-icons/fa";

export default function BranchesSection() {
  return (
    <section className="py-10 px-4 bg-white">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
        Our Branches in Indore
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">

        {branches.map((branch, index) => {
          let imagePath = "";
          let badges: { label: string; type: "english" | "computer" }[] = [];

          if (branch.slug === "/nanda-nagar") {
            imagePath = "/home/branch-nanda-nagar.jpg";
            badges = [
              { label: "English", type: "english" },
              { label: "Computer", type: "computer" },
            ];
          } else if (branch.slug === "/bapat-square") {
            imagePath = "/home/branch-bapat-square.jpg";
            badges = [{ label: "English", type: "english" }];
          } else if (branch.slug === "/aurobindo-hospital") {
            imagePath = "/home/branch-aurobindo-hospital.jpg";
            badges = [{ label: "Computer", type: "computer" }];
          }

          return (
            <Link
              key={branch.slug}
              href={branch.slug}
              className="
                flex items-center gap-4
                border rounded-2xl p-4
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-lg
                animate-fadeUp
              "
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Branch Image */}
              <img
                src={imagePath}
                alt={`${branch.name} branch`}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />

              {/* Branch Info */}
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                  {branch.name}
                </p>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {badges.map((badge) => (
                    <span
                      key={badge.label}
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        badge.type === "english"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {badge.type === "english" ? (
                        <FaMicrophone />
                      ) : (
                        <FaLaptop />
                      )}
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-blue-600 text-sm font-medium">
                View →
              </span>
            </Link>
          );
        })}

        {/* 🌐 ONLINE OPTION */}
        <div className="pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Online Option
          </h3>

          <Link
            href="/online-english"
            className="
              flex items-center gap-4
              border rounded-2xl p-4
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-lg
              animate-fadeUp
            "
            style={{ animationDelay: "0.4s" }}
          >
            <img
              src="/home/online-zoom.jpg"
              alt="Online English Zoom Class"
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />

            <div className="flex-1">
              <p className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FaGlobe className="text-green-600" />
                Online English
              </p>

              <span className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                <FaMicrophone />
                English
              </span>
            </div>

            <span className="text-blue-600 text-sm font-medium">
              View →
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}
