import * as React from "react";

interface ConfirmationTemplateProps {
  name: string;
  ticketId: string;
}

export const ConfirmationTemplate: React.FC<ConfirmationTemplateProps> = ({
  name,
  ticketId,
}) => (
  <div
    style={{ fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
    <div style={{ padding: "40px 20px", backgroundColor: "#f5f5f5" }}>
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#000",
        }}>
        Signal Received: {ticketId}
      </h1>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#333",
          marginBottom: "16px",
        }}>
        Hi {name},
      </p>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#333",
          marginBottom: "16px",
        }}>
        Thank you for reaching out to Noctra Studio. We have received your
        project inquiry and assigned it ticket ID: <strong>{ticketId}</strong>.
      </p>
      <p
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          color: "#333",
          marginBottom: "16px",
        }}>
        Our team will review your request and get back to you within 24 hours to
        discuss your vision.
      </p>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          marginTop: "24px",
        }}>
        <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>
          <strong>Status:</strong> Received. Review in &lt; 24h
        </p>
      </div>
      <p
        style={{
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#666",
          marginTop: "32px",
        }}>
        Best regards,
        <br />
        <strong>Noctra Studio</strong>
        <br />
        hello@noctra.studio
      </p>
    </div>
  </div>
);
