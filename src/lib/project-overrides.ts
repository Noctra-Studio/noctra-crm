export const PROJECT_OVERRIDES: Record<string, { challenge: string; solution: string }> = {
  woodax: {
    challenge: "Diseñar y fabricar mobiliario de autor para una audiencia de alto poder adquisitivo, elevando el estándar de exclusividad mediante el uso de materiales de la más alta calidad y un nivel de personalización sin precedentes en cada pieza.",
    solution: "Creamos una plataforma digital inmersiva que refleja la sofisticación de la marca, permitiendo que los materiales y el detalle artesanal sean los protagonistas, facilitando la conexión directa con clientes premium."
  },
  valtru: {
    challenge: "Transformar entornos cotidianos en espacios de autor que respiren armonía y equilibrio. El desafío reside en interpretar la esencia de cada cliente para crear un diseño 100% adaptado que fusione funcionalidad profesional con una estética emocionalmente resonante.",
    solution: "Desarrollamos una identidad visual y presencia web que comunica paz y orden, utilizando un lenguaje visual minimalista y herramientas interactivas que permiten al cliente visualizar la transformación de su espacio desde la primera consulta."
  },
  dyma: {
    challenge: "Posicionar a una empresa líder en renta y venta de grúas viajeras en el ecosistema digital. El reto es escalar la visibilidad de la marca a nivel nacional para capturar el mercado mexicano de maquinaria pesada mediante una presencia online robusta y profesional.",
    solution: "Implementamos una estrategia de SEO técnico y arquitectura web orientada a la conversión, optimizada para equipos industriales, asegurando que DymaGroup sea la primera opción de confianza para proyectos de infraestructura en todo México."
  }
};

export function getProjectOverrides(slug: string) {
  const lowerSlug = slug.toLowerCase();
  for (const [key, value] of Object.entries(PROJECT_OVERRIDES)) {
    if (lowerSlug.includes(key)) {
      return value;
    }
  }
  return null;
}
