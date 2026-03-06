export const TASK_TEMPLATES: Record<string, {
  phase: string
  tasks: string[]
}[]> = {
  web_presence: [
    {
      phase: 'Discovery',
      tasks: [
        'Brief inicial completado',
        'Accesos recibidos (hosting, dominio, analytics)',
        'Moodboard aprobado por el cliente',
      ]
    },
    {
      phase: 'Diseño',
      tasks: [
        'Wireframes aprobados',
        'Diseño desktop aprobado',
        'Diseño mobile aprobado',
        'Assets y recursos recibidos',
      ]
    },
    {
      phase: 'Desarrollo',
      tasks: [
        'Ambiente de desarrollo configurado',
        'Homepage desarrollada',
        'Páginas internas desarrolladas',
        'Formularios de contacto funcionando',
        'SEO técnico implementado',
        'Google Analytics configurado',
        'Optimización de velocidad aplicada',
      ]
    },
    {
      phase: 'Lanzamiento',
      tasks: [
        'QA en múltiples dispositivos (mobile, tablet, desktop)',
        'QA cross-browser (Chrome, Safari, Firefox)',
        'Velocidad < 1.5s verificada en PageSpeed',
        'DNS configurado y propagado',
        'SSL activo y funcionando',
        'Redirecciones configuradas',
        'Entrega y presentación al cliente',
      ]
    },
    {
      phase: 'Post-lanzamiento',
      tasks: [
        'Capacitación al cliente',
        'Documentación entregada',
        'Período de soporte iniciado (30 días)',
        'Google Search Console configurado',
      ]
    },
  ],

  ecommerce: [
    {
      phase: 'Discovery',
      tasks: [
        'Catálogo de productos recibido',
        'Pasarela de pago definida (Stripe/MercadoPago)',
        'Política de envíos y devoluciones definida',
        'Accesos a plataformas recibidos',
      ]
    },
    {
      phase: 'Diseño',
      tasks: [
        'Diseño de homepage aprobado',
        'Diseño de página de producto aprobado',
        'Diseño de carrito y checkout aprobado',
        'Diseño mobile aprobado',
      ]
    },
    {
      phase: 'Desarrollo',
      tasks: [
        'Catálogo de productos cargado',
        'Pasarela de pago integrada y probada',
        'Flujo de checkout completo funcionando',
        'Emails transaccionales configurados',
        'Gestión de inventario configurada',
        'Cálculo de envíos configurado',
        'SEO de productos implementado',
      ]
    },
    {
      phase: 'Lanzamiento',
      tasks: [
        'Prueba de compra end-to-end completada',
        'QA en mobile y desktop',
        'SSL y seguridad verificados',
        'DNS y dominio configurados',
        'Entrega al cliente',
      ]
    },
    {
      phase: 'Post-lanzamiento',
      tasks: [
        'Capacitación en gestión de productos',
        'Capacitación en gestión de pedidos',
        'Analytics de ecommerce configurado',
        'Período de soporte iniciado',
      ]
    },
  ],

  custom_system: [
    {
      phase: 'Discovery',
      tasks: [
        'Requerimientos funcionales documentados',
        'Arquitectura técnica definida',
        'Base de datos diseñada',
        'Wireframes de flujos principales aprobados',
      ]
    },
    {
      phase: 'Desarrollo — Backend',
      tasks: [
        'Base de datos creada y migrada',
        'Autenticación implementada',
        'APIs principales desarrolladas',
        'Pruebas de integración completadas',
      ]
    },
    {
      phase: 'Desarrollo — Frontend',
      tasks: [
        'UI de módulos principales desarrollada',
        'Integración con APIs completada',
        'Manejo de errores implementado',
        'Responsive design aplicado',
      ]
    },
    {
      phase: 'QA y Lanzamiento',
      tasks: [
        'Pruebas funcionales completadas',
        'Pruebas de carga realizadas',
        'Seguridad auditada',
        'Deploy a producción',
        'Entrega y capacitación',
      ]
    },
    {
      phase: 'Post-lanzamiento',
      tasks: [
        'Monitoreo configurado',
        'Backups automáticos configurados',
        'Documentación técnica entregada',
        'Período de soporte iniciado',
      ]
    },
  ],

  // Default for any other type
  default: [
    {
      phase: 'Inicio',
      tasks: [
        'Brief inicial completado',
        'Alcance definido y aprobado',
      ]
    },
    {
      phase: 'Ejecución',
      tasks: [
        'Primera entrega realizada',
        'Revisiones incorporadas',
        'Entrega final aprobada',
      ]
    },
    {
      phase: 'Cierre',
      tasks: [
        'Entrega al cliente',
        'Capacitación completada',
      ]
    },
  ]
}

export function getTemplateForServiceType(
  serviceType: string | null
) {
  return TASK_TEMPLATES[serviceType ?? 'default'] 
    ?? TASK_TEMPLATES.default
}
