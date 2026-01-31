export default function TestimonialsSection() {
  return (
    <section className="py-10 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-8">
        What Our Students Say
      </h2>

      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3">
        
        {/* Nanda Nagar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/home/review-1.jpg"
              alt="Riya - Nanda Nagar"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-800">
                Riya
              </p>
              <p className="text-sm text-gray-500">
                Nanda Nagar Branch
              </p>
            </div>
          </div>

          <p className="text-yellow-500 text-sm mb-2">
            ⭐⭐⭐⭐⭐
          </p>

          <p className="text-gray-700 text-sm leading-relaxed">
            English Club helped me gain confidence in spoken English.
            Daily speaking practice made a big difference.
          </p>
        </div>

        {/* Bapat Square */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/home/review-2.jpg"
              alt="Ankit - Bapat Square"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-800">
                Ankit
              </p>
              <p className="text-sm text-gray-500">
                Bapat Square Branch
              </p>
            </div>
          </div>

          <p className="text-yellow-500 text-sm mb-2">
            ⭐⭐⭐⭐⭐
          </p>

          <p className="text-gray-700 text-sm leading-relaxed">
            Very practical teaching method. My communication skills
            improved a lot after joining English Club.
          </p>
        </div>

        {/* Aurobindo Hospital */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/home/review-3.jpg"
              alt="Neha - Aurobindo Hospital"
              className="w-14 h-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-800">
                Neha
              </p>
              <p className="text-sm text-gray-500">
                Aurobindo Hospital Branch
              </p>
            </div>
          </div>

          <p className="text-yellow-500 text-sm mb-2">
            ⭐⭐⭐⭐⭐
          </p>

          <p className="text-gray-700 text-sm leading-relaxed">
            Best environment for beginners. Teachers are friendly
            and very supportive.
          </p>
        </div>

      </div>
    </section>
  );
}
