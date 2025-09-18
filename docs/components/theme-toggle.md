# Theme Toggle

The theme toggle surfaces the product’s attention to detail. It uses CSS custom properties and respects system preferences.

## Behaviour

- Defaults to the user’s `prefers-color-scheme` media query unless an explicit choice is stored in `localStorage` under `focusflow.theme`.
- Clicking the toggle flips between `light` and `dark` themes and persists the preference.
- Importing a JSON export also restores the theme that was active when the export was created.

## Implementation Notes

- See `modern-todo-app/assets/app.js` for `applyTheme`, `loadTheme`, and `updateThemeToggleLabel` helpers.
- CSS variables in `modern-todo-app/assets/styles.css` are defined on `:root` and adjusted when `body[data-theme="light"]` is active.
- The toggle button updates its label and emoji so screen readers announce the target state ("Switch to light theme").

## Enhancements

- Add animation easing when switching themes by transitioning background/foreground colors.
- Sync with OS preference changes by listening to the media query change event (already handled for modern browsers).
- Mirror theme selection across tabs with the `storage` event if the app is open in multiple windows.
