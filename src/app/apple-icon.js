import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08090a",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
          <path
            d="M33.5 7.55A19 19 0 1 1 14.5 7.55"
            stroke="#f4f1ea"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M24 8c7 6 7 19 0 26-7-7-7-20 0-26Z"
            fill="#f4f1ea"
            fillOpacity="0.16"
            stroke="#f4f1ea"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M24 13v17" stroke="#f4f1ea" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="14.5" cy="7.55" r="2.9" fill="#f4f1ea" />
        </svg>
      </div>
    ),
    size
  );
}
