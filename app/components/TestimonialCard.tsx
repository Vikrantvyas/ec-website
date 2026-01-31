type TestimonialProps = {
  review: string;
  name: string;
  role?: string;
  branch?: string;
};

export default function TestimonialCard({
  review,
  name,
  role,
  branch,
}: TestimonialProps) {
  return (
    <div>
      <p className="text-gray-700">
        ⭐⭐⭐⭐⭐ <br />
        “{review}”
      </p>

      <span className="text-sm text-gray-600">
        — {name}
        {role && `, ${role}`}
        {branch && (
          <>
            {" "}• <span className="font-medium">{branch}</span>
          </>
        )}
      </span>
    </div>
  );
}
