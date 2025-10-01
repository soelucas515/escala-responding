=== frontend/js/form.js ===
/**
 * frontend/js/form.js
 *
 * MÓDULO: Formulario en 3 pasos (nombre → detalles → email)
 *
 * DOCUMENTACIÓN NUTRIDA:
 *  - Objetivo pedagógico: que entiendas eventos, validación y fetch().
 *  - Estructura de pasos:
 *     Step 1: #step-name       (solo nombre)
 *     Step 2: #step-details    (edad, nacionalidad, razón)   -- sin email
 *     Step 3: #step-email      (email final y submit)
 *
 *  - Por qué pedir email al final:
 *     1) UX: parecer íntimo, pedimos lo mínimo primero.
 *     2) Técnica: podemos validar reglas de negocio antes de pedir email.
 *     3) Seguridad/Privacidad: pedimos email sólo si avanzan.
 *
 *  - Validaciones implementadas:
 *     - Nombre requerido.
 *     - Edad número > 0 y >= 18 (regla de negocio).
 *     - Nacionalidad igual a "colombiano" (case-insensitive).
 *     - Email formato básico con regex.
 *
 *  - Flujo de datos:
 *     - Guardamos `nombre` temporalmente en form.dataset.nombre.
 *     - Al enviar, hacemos POST a /api/apply con { nombre, edad, nacionalidad, razon, email }.
 *
 *  - Notas educativas:
 *     - Siempre revalidar en servidor (se implementa en backend).
 *     - Usamos aria-live para que lectores de pantalla lean mensajes nuevos.
 */

function qs(root, sel) { return root.querySelector(sel); }

export function initForm(rootId = '#form-flow') {
  const root = document.querySelector(rootId);
  if (!root) return;

  // Step 1 elements
  const stepName = qs(root, '#step-name');
  const inputNombre = qs(stepName, '#input-nombre');
  const btnNext = qs(stepName, '#btn-next');
  const nameError = qs(stepName, '#name-error');

  // Step 2 elements
  const stepDetails = qs(root, '#step-details');
  const greeting = qs(stepDetails, '#greeting');
  const edadEl = qs(stepDetails, '#edad');
  const nacionalidadEl = qs(stepDetails, '#nacionalidad');
  const razonEl = qs(stepDetails, '#razon');
  const detailsError = qs(stepDetails, '#details-error');
  const btnContinue = qs(stepDetails, '#btn-continue');
  const btnBackToName = qs(stepDetails, '#btn-back-to-name');

  // Step 3 elements
  const stepEmail = qs(root, '#step-email');
  const finalNote = qs(stepEmail, '#final-note');
  const emailEl = qs(stepEmail, '#email');
  const emailError = qs(stepEmail, '#email-error');
  const btnSubmit = qs(stepEmail, '#btn-submit');
  const btnBackToDetails = qs(stepEmail, '#btn-back-to-details');
  const formStatus = qs(stepEmail, '#form-status');

  // Helpers
  const show = (el) => { el.style.display = ''; };
  const hide = (el) => { el.style.display = 'none'; };
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
  }

  // Step navigation
  btnNext.addEventListener('click', () => {
    const nombre = (inputNombre.value || '').trim();
    nameError.textContent = '';
    if (!nombre) {
      nameError.textContent = 'Por favor ingresa tu nombre.';
      return;
    }
    // pasar al paso 2
    hide(stepName);
    greeting.textContent = `Hola ${nombre}. Ahora completa algunos datos:`;
    // guardar nombre de forma simple en dataset
    stepDetails.dataset.nombre = nombre;
    show(stepDetails);
  });

  btnBackToName.addEventListener('click', () => {
    hide(stepDetails);
    show(stepName);
  });

  btnContinue.addEventListener('click', () => {
    detailsError.textContent = '';

    const nombre = stepDetails.dataset.nombre || '';
    const edad = Number(edadEl.value);
    const nacionalidad = (nacionalidadEl.value || '').trim();
    const razon = (razonEl.value || '').trim();

    if (!nombre) { detailsError.textContent = 'Error interno: nombre perdido. Vuelve al paso anterior.'; return; }
    if (!edad || isNaN(edad) || edad <= 0) { detailsError.textContent = 'Ingresa una edad válida.'; return; }
    if (edad < 18) { detailsError.textContent = `Lo siento ${nombre}, eres menor de edad y no puedes aplicar.`; return; }
    if (!nacionalidad) { detailsError.textContent = 'Indica tu nacionalidad.'; return; }
    if (nacionalidad.toLowerCase() !== 'colombiano') { detailsError.textContent = `Lo siento ${nombre}, solo colombianos pueden aplicar.`; return; }
    if (!razon) { detailsError.textContent = 'Cuéntanos por qué quieres aplicar.'; return; }

    // Si todo OK, pasar a pedir email
    hide(stepDetails);
    // preparamos Step 3 mostrando un resumen y solicitando email
    finalNote.textContent = `Gracias ${nombre}. Revisaremos tu solicitud y te enviaremos la respuesta por email. Ahora por favor indica tu correo.`;
    // Guardamos datos temporales en dataset para que el formulario los recoja
    stepEmail.dataset.nombre = nombre;
    stepEmail.dataset.edad = String(edad);
    stepEmail.dataset.nacionalidad = nacionalidad;
    stepEmail.dataset.razon = razon;
    show(stepEmail);
  });

  btnBackToDetails.addEventListener('click', () => {
    hide(stepEmail);
    show(stepDetails);
  });

  // Submit final (step 3)
  stepEmail.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    emailError.textContent = '';
    formStatus.textContent = '';
    btnSubmit.disabled = true;

    const nombre = stepEmail.dataset.nombre || '';
    const edad = Number(stepEmail.dataset.edad || 0);
    const nacionalidad = stepEmail.dataset.nacionalidad || '';
    const razon = stepEmail.dataset.razon || '';
    const email = (emailEl.value || '').trim();

    if (!nombre || !edad || !nacionalidad || !razon) {
      formStatus.textContent = 'Error: datos incompletos. Recarga la página e intenta de nuevo.';
      btnSubmit.disabled = false;
      return;
    }
    if (!validateEmail(email)) {
      emailError.textContent = 'Email inválido.';
      btnSubmit.disabled = false;
      return;
    }

    // Payload para el servidor
    const payload = { nombre, edad, nacionalidad, razon, email };

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        // el servidor manda un mensaje de error estructurado
        throw new Error(data?.error || 'Error en el servidor');
      }

      // Éxito: informamos al usuario en la página (no solo alert)
      formStatus.textContent = `Solicitud enviada. ${nombre}, recibirás un correo en ${email}. También hemos notificado a la administración.`;
      // opcional: limpiar campos
      inputNombre.value = '';
      edadEl.value = '';
      nacionalidadEl.value = '';
      razonEl.value = '';
      emailEl.value = '';
      btnSubmit.disabled = false;
      // mantendremos ocultos pasos para evitar reenvío accidental
      hide(stepEmail);
      show(stepName); // volvemos al inicio si desea otra
    } catch (err) {
      console.error(err);
      formStatus.textContent = `No se pudo enviar la solicitud: ${err.message}`;
      btnSubmit.disabled = false;
    }
  });
}