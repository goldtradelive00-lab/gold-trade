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
          background: "linear-gradient(135deg, #1a2025 0%, #0e1419 100%)",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(circle at 35% 30%, #fbe9a8 0%, #ecc246 45%, #b9860f 100%)",
            border: "5px solid #8a6512",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              right: 6,
              bottom: 6,
              borderRadius: "50%",
              border: "2px solid rgba(255,246,216,0.55)",
              display: "flex",
            }}
          />
          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: "#3d2e00",
              letterSpacing: -2,
              display: "flex",
            }}
          >
            GT
          </div>
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 26,
              width: 16,
              height: 16,
              background: "rgba(255,246,216,0.9)",
              transform: "rotate(45deg)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
