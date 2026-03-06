import * as React from "react";

interface ContactTemplateProps {
  name: string;
  email: string;
  website?: string;
  service: string;
  budget: string;
  details: string;
}

export const ContactTemplate: React.FC<Readonly<ContactTemplateProps>> = ({
  name,
  email,
  website,
  service,
  budget,
  details,
}) => (
  <div style={{ fontFamily: "sans-serif", color: "#171717" }}>
    <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>
      New Project Inquiry
    </h1>

    <div
      style={{
        marginBottom: "32px",
        padding: "24px",
        backgroundColor: "#f5f5f5",
        borderRadius: "8px",
      }}>
      <h2
        style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
        Client Details
      </h2>
      <p style={{ margin: "8px 0" }}>
        <strong>Name:</strong> {name}
      </p>
      <p style={{ margin: "8px 0" }}>
        <strong>Email:</strong> {email}
      </p>
      {website && (
        <p style={{ margin: "8px 0" }}>
          <strong>Website:</strong> {website}
        </p>
      )}
    </div>

    <div style={{ marginBottom: "32px" }}>
      <h2
        style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
        Project Scope
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e5e5",
                width: "140px",
                color: "#737373",
              }}>
              Service
            </td>
            <td
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e5e5",
                fontWeight: "500",
              }}>
              {service}
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e5e5",
                width: "140px",
                color: "#737373",
              }}>
              Budget
            </td>
            <td
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e5e5",
                fontWeight: "500",
              }}>
              {budget}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h2
        style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
        Project Details
      </h2>
      <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{details}</p>
    </div>
  </div>
);
