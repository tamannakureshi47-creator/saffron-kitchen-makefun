// Input: mouse clicks and HTML5 drag-and-drop, plus keyboard shortcuts.
// Clicking an ingredient plates it (or sends it to the grill). Dragging an
// ingredient onto the plate does the same thing. Buttons are real buttons.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

/** Bind all controls. handlers: onIngredient, onReady, onServe, onUndo, onClear, onStart, onPause, onResume, onRestart, onMute. */
export function createInput(handlers) {
  function onClick(event) {
    const ingredient = event.target.closest('[data-ingredient]');
    if (ingredient) { handlers.onIngredient(ingredient.dataset.ingredient); return; }
    const ready = event.target.closest('[data-ready]');
    if (ready) { handlers.onReady(ready.dataset.ready); return; }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const name = action.dataset.action;
    if (name === 'serve') handlers.onServe();
    else if (name === 'undo') handlers.onUndo();
    else if (name === 'clear') handlers.onClear();
    else if (name === 'start') handlers.onStart();
    else if (name === 'pause') handlers.onPause();
    else if (name === 'resume') handlers.onResume();
    else if (name === 'restart') handlers.onRestart();
    else if (name === 'mute') handlers.onMute();
    else if (name === 'how') handlers.onHow();
  }

  document.addEventListener('click', onClick);

  // Drag an ingredient card onto the plate, or onto the grill area.
  document.addEventListener('dragstart', (event) => {
    const card = event.target.closest('[data-ingredient]');
    if (!card) return;
    event.dataTransfer.setData('text/plain', card.dataset.ingredient);
    event.dataTransfer.effectAllowed = 'copy';
  });
  const plate = document.getElementById('plate-area');
  if (plate) {
    plate.addEventListener('dragover', (event) => { event.preventDefault(); plate.classList.add('drag-over'); });
    plate.addEventListener('dragleave', () => plate.classList.remove('drag-over'));
    plate.addEventListener('drop', (event) => {
      event.preventDefault();
      plate.classList.remove('drag-over');
      const id = event.dataTransfer.getData('text/plain');
      if (id) handlers.onIngredient(id);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      const screen = document.body.dataset.screen;
      if (screen === 'title' || screen === 'over') { event.preventDefault(); handlers.onStart(); }
    } else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
      handlers.onPause();
    } else if (event.key === 'm' || event.key === 'M') {
      handlers.onMute();
    }
  });
}
