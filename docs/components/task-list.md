# Task List Component

The task list renders each to-do entry with metadata, actions, and accessibility affordances.

## Responsibilities

- Sync with `localStorage` through the view model defined in `assets/app.js`.
- Reflect filter/search state changes without reloading the page.
- Surface primary actions (complete, edit, delete) using explicit buttons and keyboard focus states.

## Anatomy

```
<li class="task-item" data-id="…">
  <label class="task-toggle">…</label>
  <div class="task-content">
    <p class="task-title"></p>
    <p class="task-notes"></p>
    <div class="task-meta">
      <span class="due"></span>
      <span class="priority"></span>
      <span class="created"></span>
    </div>
  </div>
  <div class="task-actions">…</div>
</li>
```

## Accessibility

- Checkbox uses native input for assistive tech compatibility.
- Edit/delete buttons expose `aria-label` text and emoji are marked `aria-hidden`.
- Empty state leverages `aria-live` to announce updates when the list changes.

## Extensibility

- Add avatars/labels by extending the template in `index.html`.
- Hook into the render pipeline in `assets/app.js::render` to inject additional badges.
- For drag-and-drop reordering, wrap `<li>` items in a library like `SortableJS` while preserving the dataset IDs.
