import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "English Club - अपना Perfect Demo Class Time जानें";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #ecfdf5 100%)",
          color: "#111827",
          padding: "50px 70px",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "#1d4ed8",
            marginBottom: 12,
          }}
        >
          English Club
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            marginBottom: 35,
          }}
        >
          अपना Perfect Demo Class Time जानें
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          {/* Person */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 170,
            }}
          >
            <div style={{ fontSize: 75 }}>🧑</div>
            <div
              style={{
                fontSize: 25,
                fontWeight: 700,
                color: "#374151",
              }}
            >
              Start
            </div>
          </div>

          {/* Questions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: 650,
            }}
          >
            {[
              "1. आपकी उम्र?",
              "2. आपकी पढ़ाई?",
              "3. इंग्लिश का लेवल?",
              "4. Demo Class कब?",
              "5. Zoom के बारे में?",
            ].map((question) => (
              <div
                key={question}
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "2px solid #bfdbfe",
                  borderRadius: 14,
                  padding: "10px 22px",
                  fontSize: 25,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    color: "#2563eb",
                    marginRight: 12,
                  }}
                >
                  ✓
                </span>

                {question}
              </div>
            ))}
          </div>

          {/* Goal */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 170,
            }}
          >
            <div style={{ fontSize: 75 }}>🎯</div>
            <div
              style={{
                fontSize: 25,
                fontWeight: 700,
                color: "#15803d",
              }}
            >
              Goal
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 25,
            fontWeight: 600,
            color: "#4b5563",
          }}
        >
          बस 5 आसान सवालों के जवाब दें
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}