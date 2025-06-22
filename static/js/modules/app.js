// modules/app.js
// Main entry point for all modules

import { initDashboardDrag } from "./dashboard/drag.js";
import { initDashboardLogic } from "./dashboard/logic.js";
import { initSidebar } from "./sidebar/index.js";
import { initQuizMinimal } from "./quiz/minimal.js";
import { initQuizMcqInline } from "./quiz/mcq_inline.js";
import { loadQuizMarkdown } from "./quiz/markdown_loader.js";
import { initLessonInteractions } from "./lesson/interactions.js";
import { initUserModule } from "./user/index.js";
import { initHeaderSync } from "./header/sync.js";
import { initAdminPanel } from "./admin/index.js";

// Initialize all modules on DOMContentLoaded
// (You can add logic here to only initialize modules on relevant pages)
document.addEventListener("DOMContentLoaded", () => {
  initDashboardDrag();
  initDashboardLogic();
  initSidebar();
  initQuizMinimal();
  initQuizMcqInline();
  loadQuizMarkdown();
  initLessonInteractions();
  initUserModule();
  initHeaderSync();
  initAdminPanel();
});
