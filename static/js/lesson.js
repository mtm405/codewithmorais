// lesson.js
// Attach quiz handlers for MCQ and other quiz blocks in lesson pages

document.addEventListener('DOMContentLoaded', function() {
  if (window.attachQuizHandlers) {
    attachQuizHandlers();
  }
<<<<<<< HEAD

  // Consolidated Drag-and-Drop UI Logic
  document.querySelectorAll('.block-drag-and-drop').forEach((block, blockIndex) => {
    const itemBank = block.querySelector('.drag-item-bank');
    const dropZones = block.querySelectorAll('.drop-zone');
    const resetButton = block.querySelector('.dnd-reset-button');

    // Assign unique IDs to all draggable items to ensure they can be found during drag/drop.
    block.querySelectorAll('.drag-item').forEach((item, itemIndex) => {
      if (!item.id) {
        item.id = `dnd-item-${blockIndex}-${itemIndex}`;
      }
    });

    // Drag event listeners for items
    block.querySelectorAll('.drag-item').forEach(item => {
      item.addEventListener('dragstart', e => {
        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', e => {
        item.classList.remove('dragging');
      });
    });

    // Drop event listeners for drop zones and the bank
    [...dropZones, itemBank].forEach(zone => {
      zone.addEventListener('dragover', e => {
        e.preventDefault(); // Necessary to allow dropping.
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', e => {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');

        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedItem = document.getElementById(draggedId);

        // Ensure the dragged item exists and belongs to this specific quiz block.
        if (!draggedItem || !block.contains(draggedItem)) {
          return;
        }

        const sourceZone = draggedItem.parentElement;
        const targetZone = zone;

        // If dropping in a drop-zone that already has an item, swap them.
        if (targetZone.classList.contains('drop-zone') && targetZone.children.length > 0) {
          const existingItem = targetZone.querySelector('.drag-item');
          if (existingItem && existingItem !== draggedItem) {
            // Move the existing item to the source of the dragged item.
            sourceZone.appendChild(existingItem);
          }
        }
        
        // Append the dragged item to the new zone.
        targetZone.appendChild(draggedItem);
      });
    });

    // Reset button functionality
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        // Move all draggable items for this block back to the item bank.
        block.querySelectorAll('.drag-item').forEach(item => {
          itemBank.appendChild(item);
        });

        // Clear any feedback styling from the drop zones.
        dropZones.forEach(zone => {
          zone.classList.remove('correct', 'incorrect');
        });
      });
    }
  });
=======
>>>>>>> c8fccd7f38bd75823a0bcf9fa700f10474e6235d
});
