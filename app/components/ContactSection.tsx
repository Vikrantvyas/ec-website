import { instituteData } from "../data/institute";

export default function ContactSection() {
  return (
    <section className="relative py-24 px-4 text-center bg-gray-900 text-white">
      {/* Soft background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      </div>

      <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
        Ready to Improve Your English?
      </h2>

      <p className="text-gray-300 mb-10 text-base md:text-lg max-w-xl mx-auto">
        Call or WhatsApp us for guidance, course details, and admission support.
      </p>

      <div className="flex justify-center gap-5 flex-wrap">
        <a
          href={`tel:${instituteData.phone}`}
          className="bg-white text-gray-900 hover:bg-gray-200 transition px-8 py-3 rounded-xl font-medium shadow-sm"
        >
          📞 Call Now
        </a>

        <a
          href={`https://wa.me/91${instituteData.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 transition text-white px-8 py-3 rounded-xl font-medium shadow-sm"
        >
          💬 WhatsApp
        </a>
      </div>
    </section>
  );
}
