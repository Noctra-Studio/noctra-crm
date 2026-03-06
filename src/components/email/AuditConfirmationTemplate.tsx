import * as React from "react";

interface AuditConfirmationTemplateProps {
  url: string;
  ticketId: string;
}

export const AuditConfirmationTemplate: React.FC<
  AuditConfirmationTemplateProps
> = ({ url, ticketId }) => (
  <div style={{ fontFamily: "sans-serif", color: "#333" }}>
    <h1>System Alert: Audit Queued</h1>
    <p>
      <strong>Target URL:</strong> {url}
    </p>
    <p>
      <strong>Ticket ID:</strong> {ticketId}
    </p>
    <hr />
    <p>
      We received your request. A Senior Architect is currently reviewing your
      stack. Expect a detailed video breakdown within 24 hours.
    </p>
    <p>
      <em>Noctra Studio Systems</em>
    </p>
  </div>
);
