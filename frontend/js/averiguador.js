=== frontend/js/averiguador.js ===
/**
 * frontend/js/averiguador.js
 *
 * MÓDULO: Averiguador (completamente separado)
 *
 * Propósito:
 *  - Mantener la lógica de "averiguador" fuera del formulario principal.
 *  - Demostrar cómo aislar funcionalidades en módulos simples.
 *
 * Cómo funciona (resumen):
 *  - Busca el botón #btn-averiguar y el contenedor #averiguador-result.
 *  - Al hacer click, abre un prompt (interacción simple) y escribe el resultado
 *    en el DOM. No toca el formulario ni comparte estado con él.
 *
 * Por qué así:
 *  - Separar módulos permite tener varias funcionalidades en la misma página
 *    sin que interfieran la una con la otra — buena práctica para crecer la app.
 */

export function initAveriguador(rootId = '#averiguador') {
  const root = document.querySelector(rootId);
  if (!root) return;
  const btn = root.querySelector('#btn-averiguar');
  const out = root.querySelector('#averiguador-result');

  btn.addEventListener('click', () => {
    // interacción intencionalmente simple: prompt
    const nombre = prompt('¿Cómo te llamas? (averiguador)'); // aislado
    if (!nombre) {
      out.textContent = 'Operación cancelada.';
      return;
    }
    // Mostramos resultado únicamente en su propio contenedor
    out.textContent = `Hola ${nombre}, demo: tienes muchas deudas 😅`;
  });
}
