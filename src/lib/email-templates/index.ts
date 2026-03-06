import { discoveryTemplate } from "./discovery-call";
import { webPresenceTemplate } from "./web-presence";
import { ecommerceTemplate } from "./ecommerce";
import { customSystemTemplate } from "./custom-system";
import { generalTemplate } from "./general";
import { welcomeTemplate } from "./welcome";

export const templates = {
  discovery_call: discoveryTemplate,
  web_presence: webPresenceTemplate,
  ecommerce: ecommerceTemplate,
  custom_system: customSystemTemplate,
  general: generalTemplate,
  welcome: welcomeTemplate,
};

export type TemplateKey = keyof typeof templates;
