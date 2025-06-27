// Enhanced Drag & Drop with Keyboard Support
// Add this to your drag and drop implementation

function enhanceDragDropAccessibility(container) {
  const dragItems = container.querySelectorAll('.drag-item');
  const dropZones = container.querySelectorAll('.drop-zone');
  
  // Add keyboard navigation
  dragItems.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-grabbable', 'true');
    item.setAttribute('aria-describedby', 'drag-instructions');
    
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDragSelection(item);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        focusNextItem(dragItems, index);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        focusPrevItem(dragItems, index);
      }
    });
  });
  
  dropZones.forEach((zone, index) => {
    zone.setAttribute('tabindex', '0');
    zone.setAttribute('role', 'button');
    zone.setAttribute('aria-dropeffect', 'move');
    
    zone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropSelectedItem(zone);
      }
    });
  });
}

function toggleDragSelection(item) {
  // Clear other selections
  item.parentElement.querySelectorAll('.drag-item').forEach(el => 
    el.classList.remove('keyboard-selected'));
  
  // Toggle this item
  item.classList.toggle('keyboard-selected');
  item.setAttribute('aria-grabbed', item.classList.contains('keyboard-selected'));
}

function focusNextItem(items, currentIndex) {
  const nextIndex = (currentIndex + 1) % items.length;
  items[nextIndex].focus();
}

function focusPrevItem(items, currentIndex) {
  const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
  items[prevIndex].focus();
}

function dropSelectedItem(dropZone) {
  const selectedItem = document.querySelector('.drag-item.keyboard-selected');
  if (selectedItem && dropZone.children.length === 0) {
    dropZone.appendChild(selectedItem);
    selectedItem.classList.remove('keyboard-selected');
    selectedItem.setAttribute('aria-grabbed', 'false');
  }
}
