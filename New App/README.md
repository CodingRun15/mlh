# RUSH

A one-page kanban. Three lanes, tickets in memory, no database.

Open `index.html` in a browser. That is the whole setup.

## What it does

- Add a card to **To Do**
- Move it **Back** / **Next** through **In Progress** and **Done**
- **Kill** a card
- Filter by title and by lane

Refresh wipes the board. Three sample cards load so the lanes are not empty.

## Validation

New titles are checked before they hit the array:

- Required after trim
- 3–80 characters
- At least one letter or number
- No duplicate titles (case-insensitive)

Errors sit under the field and are announced to assistive tech.

## Filters

- Search box matches titles
- Lane chips: All / To Do / In Progress / Done
- Counts and empty copy update from the same `cards` array

## Files

| File | Role |
| --- | --- |
| `index.html` | Layout |
| `styles.css` | Ticket-stub look |
| `app.js` | In-memory state + render |

No build step. No Next.js. No `npm`.

## Later, if you want it

- `localStorage` so refresh keeps cards
- Drag and drop
- A Next.js port with `useState` instead of the global array
