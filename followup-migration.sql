-- Create followup_templates table
CREATE TABLE IF NOT EXISTS followup_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- e.g., 'proposal_viewed_3d', 'proposal_sent_5d', etc.
    locale TEXT NOT NULL DEFAULT 'es', -- 'es' or 'en'
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_followup_templates_type_locale ON followup_templates(type, locale);

-- Seed templates (Spanish)
INSERT INTO followup_templates (type, locale, subject, body) VALUES
('proposal_viewed_3d', 'es', 'Re: Propuesta Noctra Studio — ¿Tienes alguna duda?', 'Hola [nombre], vi que tuviste oportunidad de revisar la propuesta. ¿Tienes alguna pregunta sobre el alcance o los términos? Estoy disponible para una llamada rápida esta semana si te ayuda a tomar la decisión.'),
('proposal_sent_5d', 'es', 'Tu propuesta de Noctra Studio', 'Hola [nombre], quería asegurarme de que recibiste la propuesta que te envié. ¿Llegó bien a tu correo? Si tienes dudas o quieres ajustar algo, con gusto lo vemos.'),
('contract_sent_3d', 'es', 'Contrato pendiente — Noctra Studio', 'Hola [nombre], te escribo porque el contrato de tu proyecto está pendiente de firma. ¿Hay algo que quieras revisar antes de firmarlo? Podemos agendar una llamada si prefieres.'),
('lead_no_contact_3d', 'es', 'Tu solicitud en Noctra Studio', 'Hola [nombre], recibimos tu solicitud hace unos días pero no hemos logrado platicar. Cuéntame, ¿en qué podemos ayudarte con tu proyecto?');

-- Seed templates (English)
INSERT INTO followup_templates (type, locale, subject, body) VALUES
('proposal_viewed_3d', 'en', 'Re: Noctra Studio Proposal — Any questions?', 'Hi [nombre], I noticed you had a chance to review the proposal. Do you have any questions about the scope or terms? I am available for a quick call this week if that helps with your decision.'),
('proposal_sent_5d', 'en', 'Your Noctra Studio Proposal', 'Hi [nombre], I wanted to make sure you received the proposal I sent. Did it reach your inbox? If you have questions or want to adjust anything, I''m happy to discuss.'),
('contract_sent_3d', 'en', 'Pending Contract — Noctra Studio', 'Hi [nombre], I''m writing because your project contract is pending signature. Is there anything you''d like to review before signing? We can schedule a call if you prefer.'),
('lead_no_contact_3d', 'en', 'Your inquiry at Noctra Studio', 'Hi [nombre], we received your inquiry a few days ago but haven''t had a chance to talk yet. Let me know how we can help with your project!');
