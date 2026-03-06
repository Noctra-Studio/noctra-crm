# Noctra Sign: Guía de Firma Digital

Noctra Sign es la solución integrada para el cierre de negocios en segundos. Implementa estándares internacionales de firma digital (ESIGN / UETA) para garantizar que tus propuestas y contratos tengan validez legal sin salir de Noctra.

## Para Usuarios (Vendedores / PMs)

### Cómo enviar tu primer contrato a firma

1. **Prepara el documento:** Dentro de "Propuestas" o "Contratos", completa los servicios y términos.
2. **Solicita la firma:** Haz clic en el botón **"Solicitar Firma"** en el encabezado.
3. **Link Seguro:** El sistema generará una URL única. Puedes copiarla y enviarla por WhatsApp/Email o dejar que Noctra envíe la notificación automática.
4. **Seguimiento:** En la pestaña **"Firmas"** de la propuesta, podrás ver si el cliente ya abrió el link o si el documento ya está firmado.

### Qué recibe el cliente

El cliente recibirá una vista premium donde podrá revisar el documento y firmar usando su dedo (en móvil) o el mouse. Al terminar, recibirá una copia firmada automáticamente.

---

## Factores Legales (Validez de la Firma)

Noctra Sign se basa en el principio de **No Repudio**. Para cada firma capturada, el sistema genera un **Trial de Auditoría** que se estampa en el PDF final:

- **IP Address:** Ubicación lógica desde donde se firmó.
- **Timestamp:** Fecha y hora exacta (UTC).
- **User Agent:** Dispositivo y navegador utilizado.
- **Hash de Integridad:** Un código único que garantiza que el PDF no ha sido modificado después de la firma.

_Nota: Para casos de alta criticidad legal en jurisdicciones específicas, consulta con tu equipo legal. Noctra Sign cumple con la mayoría de acuerdos comerciales B2B bajo ESIGN Act._

---

## Para Desarrolladores

### Seguridad y Generación de Hashes

Los links de firma se generan mediante un `UUID v4` combinado con un `salt` secreto en el servidor.

- **Verificación:** Al cargar la página de firma, una Server Action valida el hash contra la base de datos de Supabase.
- **Expiración:** Por defecto, los links de firma expiran en 30 días o cuando el documento cambia a estado `SIGNED`.

### Stamping Logic

Utilizamos `pdf-lib` para manipular el buffer del archivo original:

1. Cargamos el PDF existente.
2. Agregamos una página de anexo o estampamos en el footer de la última página.
3. Convertimos el `SignaturePad` dataUrl a `PNG` y lo embebemos en el documento.
