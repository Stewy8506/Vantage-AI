import { ImageResponse } from "next/og";

export const alt = "Virality Mapper - AI LinkedIn Copywriting Arena";
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
          background: "#0d0d0e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          border: "4px solid #1e1e24",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Logo Brand Tag */}
          <div
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "8px 16px",
              borderRadius: "40px",
              color: "#a1a1aa",
              fontSize: "20px",
              fontWeight: "600",
              letterSpacing: "1px",
              display: "flex",
              marginBottom: "40px",
            }}
          >
            VIRALITY MAPPER
          </div>
          {/* Main Hook Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: "800",
              color: "#ffffff",
              lineHeight: "1.2",
              letterSpacing: "-2px",
              marginBottom: "24px",
              display: "flex",
            }}
          >
            Settle the copy. Dominate the feed.
          </div>
          {/* Sub-Description */}
          <div
            style={{
              fontSize: "26px",
              color: "#a1a1aa",
              lineHeight: "1.5",
              maxWidth: "800px",
              display: "flex",
            }}
          >
            Stop guessing LinkedIn performance. Put specialist AI copywriters in a peer-critique debate arena and generate the survivor copy.
          </div>
        </div>

        {/* Feature Tags */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            color: "#ffffff",
            fontSize: "20px",
            fontWeight: "500",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#f43f5e", marginRight: "8px" }}>✦</span> 3-Agent Debate Arena
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#10b981", marginRight: "8px" }}>✦</span> RAG Success Feedback
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#3b82f6", marginRight: "8px" }}>✦</span> Real-Time Trend Grounding
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
