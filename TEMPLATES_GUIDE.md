# Templates Organization Guide

## Overview
This guide documents the new organized template structure for Quiz Master 3.0.

## Directory Structure

### 📁 layouts/
**Purpose:** Base templates and layout structures
- `base.html` - Main application layout
- `head.html` - HTML head section with meta tags and styles

**Usage:** Extended by page templates for consistent layout

### 📁 pages/
**Purpose:** Main application page templates
- `dashboard.html` - User dashboard
- `lesson.html` - Lesson display page
- `profile.html` - User profile page
- `admin.html` - Admin panel
- `index.html` - Landing page

**Usage:** Individual page implementations

### 📁 components/
**Purpose:** Reusable UI components
- `navigation.html` - Main navigation
- `sidebar.html` - Application sidebar
- `footer.html` - Page footer
- `header_bar.html` - Header bar component
- `code_editor.html` - Code editor component

**Usage:** Included in layouts and pages for modularity

### 📁 blocks/
**Purpose:** Content block templates for lessons
- `quiz.html` - Interactive quiz blocks
- `code_snippet.html` - Code display blocks
- `image.html` - Image blocks
- `text.html` - Text content blocks
- `debug_challenge.html` - Debug challenge blocks

**Usage:** Dynamic content blocks for lesson rendering

### 📁 forms/
**Purpose:** Form-specific templates (future use)
**Usage:** Dedicated form templates and components

### 📁 errors/
**Purpose:** Error page templates (future use)
**Usage:** 404, 500, and other error page templates

## Naming Conventions

- **Layouts:** Descriptive names (base.html, head.html)
- **Pages:** Page purpose (dashboard.html, lesson.html)
- **Components:** Component function (navigation.html, sidebar.html)
- **Blocks:** Block type (quiz.html, code_snippet.html)

## Best Practices

1. Use relative imports from template root
2. Follow the established directory structure
3. Keep components small and focused
4. Document complex template logic
5. Use consistent naming conventions

## Migration Notes

- **Old Structure:** All templates in single directory with partials/
- **New Structure:** Organized hierarchy with clear separation of concerns
- **Breaking Changes:** Template import paths have changed
- **Compatibility:** All template references have been updated

## Example Usage

```jinja2
{# Extending base layout #}
{% extends 'layouts/base.html' %}

{# Including components #}
{% include 'components/navigation.html' %}

{# Including blocks #}
{% include 'blocks/quiz.html' %}
```

## Performance Benefits

- **Faster Template Loading:** Organized structure improves caching
- **Better Maintainability:** Clear separation of concerns
- **Improved Developer Experience:** Easier to find and modify templates
- **Scalability:** Structure supports future growth
