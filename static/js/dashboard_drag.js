// static/js/dashboard_drag.js
// Enable drag-and-drop and pinning for dashboard blocks

document.addEventListener("DOMContentLoaded", function() {
    const grid = document.querySelector(".dashboard-grid");
    if (!grid) return;

    // Pin/unpin logic
    grid.querySelectorAll(".grid-item").forEach(function(item) {
        const pinBtn = document.createElement("button");
        pinBtn.className = "pin-btn";
        pinBtn.title = "Pin/Unpin block";
        pinBtn.innerHTML = "<span class=\"material-symbols-outlined\">push_pin</span>";
        pinBtn.onclick = function(e) {
            e.stopPropagation();
            item.classList.toggle("pinned");
            if (item.classList.contains("pinned")) {
                pinBtn.classList.add("active");
                // Move pinned block to top
                grid.prepend(item);
            } else {
                pinBtn.classList.remove("active");
            }
        };
        // Add drag handle
        const dragHandle = document.createElement("span");
        dragHandle.className = "drag-handle material-symbols-outlined";
        dragHandle.title = "Drag to move";
        dragHandle.textContent = "drag_indicator";
        item.insertBefore(dragHandle, item.firstChild);
        item.insertBefore(pinBtn, item.firstChild);
    });
});
