export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
        What Our Students Say
      </h2>

      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3">
        {/* Testimonial 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-gray-700 mb-4">
            ⭐⭐⭐⭐⭐
            <br />
            “English Club helped me improve my spoken English confidence.
            Teachers are very supportive.”
          </p>
          <span className="text-sm text-gray-600 font-medium">
            — Student, Indore
          </span>
        </div>

        {/* Testimonial 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-gray-700 mb-4">
            ⭐⭐⭐⭐⭐
            <br />
            “Best institute for Spoken English and Computer courses.
            Very practical teaching method.”
          </p>
          <span className="text-sm text-gray-600 font-medium">
            — Working Professional
          </span>
        </div>

        {/* Testimonial 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-gray-700 mb-4">
            ⭐⭐⭐⭐⭐
            <br />
            “Good environment for beginners.
            Highly recommended.”
          </p>
          <span className="text-sm text-gray-600 font-medium">
            — Parent
          </span>
        </div>
      </div>
    </section>
  );
}
