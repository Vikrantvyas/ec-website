import Link from "next/link";
import { instituteData } from "../data/institute";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-4">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-4">

        {/* Institute Info */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            {instituteData.name}
          </h3>
          <p className="text-sm leading-relaxed">
            Spoken English & Computer Training Institute
            <br />
            Serving students in Indore since {instituteData.since}.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>

            <li>
              <Link href="/online-english" className="hover:text-white">
                Online English (Live Classes)
              </Link>
            </li>

            <li>
              <Link href="/computer-g" className="hover:text-white">
                Computer G (Computer Courses)
              </Link>
            </li>

            <li>
              <Link href="/nanda-nagar" className="hover:text-white">
                Nanda Nagar Branch
              </Link>
            </li>

            <li>
              <Link href="/bapat-square" className="hover:text-white">
                Bapat Square Branch
              </Link>
            </li>

            <li>
              <Link href="/aurobindo-hospital" className="hover:text-white">
                Aurobindo Hospital Branch
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Contact
          </h3>
          <p className="text-sm mb-2">📍 Indore, Madhya Pradesh</p>

          <p className="text-sm mb-2">
            📞{" "}
            <a
              href={`tel:${instituteData.phone}`}
              className="hover:text-white"
            >
              {instituteData.phone}
            </a>
          </p>

          <p className="text-sm">
            💬{" "}
            <a
              href={`https://wa.me/91${instituteData.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              WhatsApp Chat
            </a>
          </p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Follow Us
          </h3>

          <div className="flex gap-4 items-center">
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              aria-label="Facebook"
              className="text-[#1877F2] text-xl hover:opacity-80"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              aria-label="Instagram"
              className="text-[#E4405F] text-xl hover:opacity-80"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.youtube.com/@englishclubindore"
              target="_blank"
              aria-label="YouTube"
              className="text-[#FF0000] text-xl hover:opacity-80"
            >
              <FaYoutube />
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Follow us for updates & student success stories
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {instituteData.name}. All rights reserved.
      </div>
    </footer>
  );
}
