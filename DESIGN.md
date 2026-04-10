# Design Brief — Book My Garbage Truck

**Purpose:** GPS-based municipal waste management app for owners (fleet management), drivers (field operations, GPS), and public (pickup requests, live tracking). Role-based single app with unified login.

## Tone & Narrative
Utilitarian + trustworthy + eco-conscious. Modern municipal logistics meets fintech. Clean, functional, slightly bold — civic service that feels professional yet approachable.

## Color Palette

| Role        | Color              | OKLCH (Light)    | OKLCH (Dark)     | Usage                               |
| ----------- | ------------------ | ---------------- | ---------------- | ----------------------------------- |
| Primary     | Deep Teal          | 0.42 0.08 189    | 0.62 0.08 189    | Buttons, header, primary actions    |
| Secondary   | Teal-Green         | 0.48 0.12 142    | 0.68 0.12 142    | Status indicators, role badges      |
| Accent      | Warm Orange        | 0.58 0.22 33     | 0.68 0.22 33     | Waste fill alerts, urgent actions   |
| Destructive | Safety Red         | 0.52 0.23 27     | 0.62 0.23 27     | Women's helpline, critical alerts   |
| Neutral     | Light/Dark Grey    | 0.99/0.14        | 0.94/0.14        | Backgrounds, text                   |

## Typography
- **Display:** General Sans (bold, geometric, trustworthy)
- **Body:** DM Sans (humanist, accessible, modern)
- **Mono:** Geist Mono (data/technical info)
- **Scale:** 12/14/16/18/20/24/32 px with 1.5 line-height for body

## Structural Zones

| Zone            | Light Background | Border          | Treatment                                     |
| --------------- | ---------------- | --------------- | --------------------------------------------- |
| Header/Nav      | card (1.0)       | border (0.92)   | Teal primary bg, role indicator badge         |
| Main Content    | background (0.99) | none            | Card-based layout, variable elevation         |
| Card (elevated) | card (1.0)       | border (0.92)   | 2px subtle shadow, role-color top accent      |
| Footer          | muted/40 (0.88)  | border (0.92)   | Helpline access, women's helpline prominent  |
| Input/Select    | input (0.95)     | border (0.92)   | Focus ring in primary teal                    |

## Component Patterns
- **Role Badges:** Inline pill badges in header (Owner/Driver/Public) with role-specific secondary color
- **Safety Alert:** Women's helpline in destructive red with prominent placement, clickable tel: link
- **Chat/Call Buttons:** Bold icon buttons (md size) in primary, fixed position or card header
- **GPS Toggle:** Large primary button with pulsing status indicator when active
- **Waste Fill:** Horizontal slider with orange accent, percentage readout, visual fill meter
- **Pickup Request Cards:** Compact card with driver photo (if owner view), status badge, distance/time, action buttons
- **Live Tracking Map:** Placeholder map region with TBD integration point

## Spacing & Rhythm
- **Padding:** 16px cards, 12px internal sections, 8px compact list items
- **Gap:** 12px between cards, 8px between form elements
- **Radius:** 12px standard (cards, buttons), 8px compact elements, 24px large CTAs

## Motion & Interaction
- **Transition:** 0.3s smooth (all interactive elements)
- **Status Pulse:** 2.5s gentle pulse on active GPS/live tracking indicators
- **Hover:** Subtle shadow elevation on cards, text-opacity for secondary actions
- **Loading:** Skeleton screens for async data (drivers, requests, maps)

## Constraints & Guardrails
- Icon-first design for GPS, chat, call, waste, helpline — bold visual language
- Women's helpline always visible in footer or dedicated safety zone (safety-red utility)
- All phone numbers clickable (tel: protocol)
- Mobile-first: stack vertically, full-width on sm, grid on md+
- No gradients, no decorative animations — clarity > decoration
- High contrast for accessibility (AA+ compliance on all text/interactive elements)

## Signature Detail
**Adaptive Role Coloring:** Nav header background shifts to secondary color tint based on logged-in role (owner = primary teal, driver = secondary teal-green, public = muted with secondary badge). Creates instant visual context switching without confusing menu structures.

---
**Design System:** OKLCH palette, General Sans + DM Sans, 12/16/24px type scale, 12px radius baseline. Tokens in `index.css`, Tailwind overrides in `tailwind.config.js`.
