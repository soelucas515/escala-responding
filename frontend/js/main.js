=== frontend/js/main.js ===
/**
 * frontend/js/main.js
 *
 * Punto de entrada: inicializa módulos del frontend.
 *
 * Nota pedagógica: el uso de módulos (ES Modules) ayuda a separar
 * responsabilidades y entender eventos por módulo.
 */
import { initAveriguador } from './averiguador.js';
import { initForm } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
  initAveriguador('#averiguador'); // inicio del módulo independiente
  initForm('#form-flow');           // inicio del formulario en 3 pasos
});
