import { ImageResponse } from "next/og";

export const alt = "Kabil Muthusamy — Data, Platform & SRE";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: 54,
        background: "#fff7e8",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          border: "8px solid #111827",
          boxShadow: "18px 18px 0 #111827",
          background: "#ffffff",
          padding: 48,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 28, fontWeight: 800 }}>KABIL</span>
          <span style={{ fontSize: 24, fontWeight: 700 }}>DATA / PLATFORM / SRE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.9 }}>
            SYSTEMS CALM.
          </div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.9 }}>
            DATA MOVING.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: "55%",
            height: 26,
            border: "4px solid #111827",
            background: "#dd614c",
          }}
        />
      </div>
    </div>,
    size,
  );
}
