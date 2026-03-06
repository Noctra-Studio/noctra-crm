import * as React from "react";
import { QuizAnswers, RecommendationResult } from "../quiz/QuizContext";

interface AdminNewLeadTemplateProps {
  answers: QuizAnswers;
  recommendation: RecommendationResult;
}

export const AdminNewLeadTemplate = ({
  answers,
  recommendation,
}: Readonly<AdminNewLeadTemplateProps>) => {
  const { contact } = answers;

  return (
    <div
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: "#171717",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#ffffff",
      }}>
      <h1 style={{ fontSize: "24px", marginBottom: "24px", color: "#000000" }}>
        New Quiz Lead: {contact?.name}
      </h1>

      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}>
        <h2 style={{ fontSize: "18px", marginTop: "0", marginBottom: "16px" }}>
          Contact Details
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{ padding: "8px 0", color: "#6b7280", width: "120px" }}>
                Name
              </td>
              <td style={{ padding: "8px 0", fontWeight: "500" }}>
                {contact?.name}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#6b7280" }}>Email</td>
              <td style={{ padding: "8px 0", fontWeight: "500" }}>
                <a
                  href={`mailto:${contact?.email}`}
                  style={{ color: "#000000" }}>
                  {contact?.email}
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#6b7280" }}>Phone</td>
              <td style={{ padding: "8px 0", fontWeight: "500" }}>
                {contact?.phone || "N/A"}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#6b7280" }}>Company</td>
              <td style={{ padding: "8px 0", fontWeight: "500" }}>
                {contact?.company || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
        }}>
        <h2 style={{ fontSize: "18px", marginTop: "0", marginBottom: "16px" }}>
          Recommendation
        </h2>
        <div style={{ display: "flex", gap: "24px" }}>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
              Service ID
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "4px",
              }}>
              {recommendation.serviceId}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}>
              Score
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "4px",
              }}>
              {recommendation.score}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "24px",
          borderRadius: "12px",
        }}>
        <h2 style={{ fontSize: "18px", marginTop: "0", marginBottom: "16px" }}>
          Quiz Responses
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
            Business Type
          </div>
          <div style={{ marginTop: "4px" }}>{answers.businessType}</div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
            Current Situation
          </div>
          <div style={{ marginTop: "4px" }}>{answers.currentSituation}</div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
            Main Goals
          </div>
          <div style={{ marginTop: "4px" }}>
            {answers.mainGoals.map((goal) => (
              <span
                key={goal}
                style={{
                  display: "inline-block",
                  backgroundColor: "#e5e7eb",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  marginRight: "4px",
                  marginBottom: "4px",
                }}>
                {goal}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
            Timeline
          </div>
          <div style={{ marginTop: "4px" }}>{answers.timeline}</div>
        </div>

        <div>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
            Budget
          </div>
          <div style={{ marginTop: "4px" }}>{answers.budget}</div>
        </div>
      </div>
    </div>
  );
};
