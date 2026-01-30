import { instituteData } from "../data/institute";

export default function ContactSection() {
  return (
    <section className="py-6 px-4 text-center pb-28">
      <h2 className="text-2xl font-bold mb-4">
        Ready to Improve Your English?
      </h2>

      <p className="text-gray-600 mb-5">
        Call or WhatsApp us for guidance and admission details.
      </p>

      <div className="flex justify-center gap-4">
        <a
          href={`tel:${instituteData.phone}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          📞 Call Now
        </a>

        <a
          href={`https://wa.me/91${instituteData.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          💬 WhatsApp
        </a>
      </div>
    </section>
  );
}
