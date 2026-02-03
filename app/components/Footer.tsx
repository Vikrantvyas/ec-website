import Link from "next/link";
import { instituteData } from "../data/institute";

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
            {instituteData.tagline}
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
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/nanda-nagar" className="hover:text-white">Nanda Nagar Branch</Link></li>
            <li><Link href="/bapat-square" className="hover:text-white">Bapat Square Branch</Link></li>
            <li><Link href="/aurobindo-hospital" className="hover:text-white">Aurobindo Hospital Branch</Link></li>
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
            <a href={`tel:${instituteData.phone}`} className="hover:text-white">
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

        {/* 🌐 Social Media (REAL ICONS) */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Follow Us
          </h3>

          <div className="flex gap-4 items-center">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/englishclubindore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-white"
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24H12.82v-9.294H9.692V11.01h3.128V8.309c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.796.716-1.796 1.765v2.313h3.587l-.467 3.696h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/englishclubindore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-white"
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.343 3.608 1.318.975.975 1.256 2.242 1.318 3.608.058 1.266.07 1.646.07 4.84s-.012 3.574-.07 4.84c-.062 1.366-.343 2.633-1.318 3.608-.975.975-2.242 1.256-3.608 1.318-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.343-3.608-1.318-.975-.975-1.256-2.242-1.318-3.608C2.175 15.574 2.163 15.194 2.163 12s.012-3.574.07-4.84c.062-1.366.343-2.633 1.318-3.608C4.526 2.576 5.793 2.295 7.159 2.233 8.425 2.175 8.805 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.773.131 4.602.443 3.635 1.41 2.668 2.377 2.356 3.548 2.297 4.828.013 8.332 0 8.741 0 12c0 3.259.013 3.668.072 4.948.059 1.28.371 2.451 1.338 3.418.967.967 2.138 1.279 3.418 1.338 1.28.059 1.689.072 4.948.072s3.668-.013 4.948-.072c1.28-.059 2.451-.371 3.418-1.338.967-.967 1.279-2.138 1.338-3.418.059-1.28.072-1.689.072-4.948s-.013-3.668-.072-4.948c-.059-1.28-.371-2.451-1.338-3.418C19.451.443 18.28.131 17 .072 15.72.013 15.311 0 12 0z"/>
                <path d="M12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@englishclubindore"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-white"
            >
              <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.117C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.524a2.999 2.999 0 0 0-2.112 2.117A31.8 31.8 0 0 0 0 12a31.8 31.8 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.112 2.117c1.881.524 9.386.524 9.386.524s7.505 0 9.386-.524a2.999 2.999 0 0 0 2.112-2.117A31.8 31.8 0 0 0 24 12a31.8 31.8 0 0 0-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
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
