import * as React from "react";
import { RecommendationResult, QuizAnswers } from "../quiz/QuizContext";

interface QuizResultsTemplateProps {
  name: string;
  recommendation: RecommendationResult;
  answers: QuizAnswers;
}

const SERVICE_DETAILS: Record<
  string,
  { title: string; price: string; timeline: string; desc: string }
> = {
  professional: {
    title: "PROFESSIONAL WEBSITE",
    price: "Starting at $20,000 MXN",
    timeline: "6 weeks",
    desc: "A high-conversion custom website designed to establish authority and generate leads.",
  },
  ecommerce: {
    title: "ONLINE STORE",
    price: "Starting at $35,000 MXN",
    timeline: "8 weeks",
    desc: "A robust e-commerce platform built to sell products 24/7 with automated inventory.",
  },
  custom: {
    title: "CUSTOM SYSTEM",
    price: "Custom Quote",
    timeline: "12+ weeks",
    desc: "Tailor-made software to automate your specific business processes and workflows.",
  },
  optimization: {
    title: "OPTIMIZATION & GROWTH",
    price: "From $8,000 MXN/mo",
    timeline: "Ongoing",
    desc: "Continuous improvements to skyrocket your existing website's performance and rankings.",
  },
};

export const QuizResultsTemplate = ({
  name,
  recommendation,
  answers,
}: Readonly<QuizResultsTemplateProps>) => {
  const service =
    SERVICE_DETAILS[recommendation.serviceId] || SERVICE_DETAILS.professional;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        color: "#171717",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
      <div
        style={{
          backgroundColor: "#000000",
          padding: "30px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
        }}>
        <h1
          style={{
            color: "#ffffff",
            fontSize: "24px",
            margin: "0",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}>
          Your Results Are In
        </h1>
      </div>

      <div
        style={{
          padding: "40px",
          backgroundColor: "#f5f5f5",
          borderRadius: "0 0 8px 8px",
        }}>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#333",
            marginBottom: "24px",
          }}>
          Hi {name},
        </p>
        <p
          style={{
            fontSize: "16px",
            lineHeight: "1.6",
            color: "#333",
            marginBottom: "32px",
          }}>
          Based on your answers, we've identified the perfect strategy to
          achieve your goals. Here is your personalized recommendation from{" "}
          <strong>Noctra Studio</strong>.
        </p>

        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "32px",
            border: "1px solid #e5e5e5",
          }}>
          <div
            style={{
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#666",
              letterSpacing: "1px",
              marginBottom: "8px",
            }}>
            Recommended Solution
          </div>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#000",
              margin: "0 0 12px 0",
              letterSpacing: "-0.5px",
            }}>
            {service.title}
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              color: "#444",
              marginBottom: "24px",
            }}>
            {service.desc}
          </p>

          <div
            style={{
              display: "flex",
              borderTop: "1px solid #f0f0f0",
              paddingTop: "20px",
            }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  color: "#999",
                  marginBottom: "4px",
                }}>
                Investment
              </div>
              <div
                style={{ fontWeight: "bold", fontSize: "16px", color: "#000" }}>
                {service.price}
              </div>
            </div>
            <div
              style={{
                flex: 1,
                borderLeft: "1px solid #f0f0f0",
                paddingLeft: "20px",
              }}>
              <div
                style={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  color: "#999",
                  marginBottom: "4px",
                }}>
                Timeline
              </div>
              <div
                style={{ fontWeight: "bold", fontSize: "16px", color: "#000" }}>
                {service.timeline}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <a
            href="https://calendly.com/noctra-studio/consultation"
            style={{
              display: "inline-block",
              backgroundColor: "#000000",
              color: "#ffffff",
              padding: "16px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
            Schedule Free Consultation
          </a>
          <p style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
            Or reply to this email to start a conversation.
          </p>
        </div>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#999",
          fontSize: "12px",
        }}>
        &copy; {new Date().getFullYear()} Noctra Studio. All rights reserved.
      </div>
    </div>
  );
};
