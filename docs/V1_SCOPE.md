# WAYO V1 Scope

WAYO V1 is the first public London release.

This document is the **single source of truth** for what V1 includes. It
protects the launch from feature creep by recording what is required before
release and what is intentionally deferred.

> **Guiding rule:** a feature blocks V1 only if users need it to discover,
> judge, start, complete, save, review or revisit a London quest, or if it is
> needed to ship and run the app reliably. Everything else waits until it is
> explicitly promoted.

Items marked **TBD** are inside V1 scope, but their exact mechanics are not
yet decided. A TBD detail does not change what is in or out of V1.

---

## 1. V1 launch goal

At launch, a user can:

- sign in with Google or Apple
- discover London quests and filter them usefully
- understand what a quest involves: duration, distance, difficulty and stops
- see accessibility and practical information before deciding to go
- view the quest route on a map
- use their real location during the quest
- complete a quest
- save quests to come back to later
- see completed quests and collected stamps in their Passport
- manage their profile and preferences
- view useful photos and nearby coffee / food places
- read reviews and leave their own
- use the app in English or Ukrainian
- rely on the app on a mobile phone

The launch also needs **enough content to feel real**. A handful of demo
quests is not a product, so **at least 50 launch-ready London quests** are part
of V1. The MSc version has 5.

## 2. V1 must-haves

### Core exploration
- At least 50 launch-ready London quests, each with complete content
  (description, stops, photos, accessibility detail, EN + UK text)
- Explore / quest discovery
- Quest detail page
- Filters needed for useful discovery, including accessibility filters

### Location, maps and routes
- Real GPS: the user's current location, requested with a clear
  permission explanation
- Quest route shown on a map: route line, numbered stops, start and end points
- Clear route state during a quest (current stop, completed and remaining stops)
- **TBD:** quest completion method (GPS location check, QR, or both). This
  must be decided within the GPS / quest flow. It is not decided by this document.
- **Needs decision:** off-route handling, and a route from the user's current
  location to the quest start. Neither is agreed yet, so neither is a must-have
  until it is promoted.

### Authentication
- Google sign-in
- Apple sign-in
- Signed-in account state (signed in / signed out)
- Saved quests, completed quests, Passport and preferences stored per account
  and kept across sessions and devices
- Not in V1: email/password sign-in and guest mode (neither is agreed)

### Accessibility and practical detail
Structured accessibility information for every launch quest:
- stairs / steps
- narrow paths
- surface quality
- seating / rest stops
- accessible toilets
- noise level
- crowd levels

The existing practical detail is kept: duration, distance, difficulty,
start / end points and nearby public transport.

The app itself must also meet basic accessibility: readable text, sufficient
contrast, usable touch targets, and meaning that doesn't rely on colour alone.

### Saved, Passport and Profile
- **Saved:** save and remove quests, plus a saved list
- **Passport:** a record of completed quests, with collected and locked stamps
- **Profile:** user details, completed quests, collected stamps, saved places,
  and accessibility / language preferences
- No new progression mechanics (see section 4)

### Photos and POIs
- Good photos for each quest and its key locations
- Nearby coffee / food POIs shown where relevant to a quest
- **TBD:** POI data source (hand-curated or an external places service)

### Reviews
- Users can read reviews of a quest
- Users can submit a review
- Reviews are displayed in a sensible way, including empty and loading states
- **TBD:** rating and/or text format, who can review (for example, only after
  completing the quest), and moderation. These are implementation details, not
  scope blockers.

### Languages
- English and Ukrainian across the UI and all launch quest content
- Language switch, with the choice saved to the user's preferences

### QA (release-blocking)
Manual, lightweight testing, as described in [DEVELOPMENT.md](DEVELOPMENT.md):
- Core flow end-to-end: sign in → explore → quest detail → start → complete →
  Passport → profile → saved → review
- Mobile viewport and real-device testing
- GPS, map and route behaviour in real locations
- Google and Apple sign-in in production configuration
- Data kept correctly across sessions and devices
- Accessibility checks
- EN / UK localisation checks, including layout with longer Ukrainian text
- Error, empty and loading states (no network, location denied, no results)
- Regression check of the full journey before release

### Mobile release preparation
- Mobile responsiveness and device testing
- App metadata, icons and splash assets (a web manifest already exists)
- GPS permission and privacy messaging
- Privacy Policy and Terms updated for the real product. The current pages
  describe the MSc prototype.
- Production authentication configuration (Google and Apple)
- Production environment check on Railway (see [DEVELOPMENT.md](DEVELOPMENT.md))
- A release checklist
- **TBD:** distribution method (installable web app / PWA, app-store
  packaging, or another option). This document does not assume App Store or
  Google Play.

## 3. V1 exit criteria

V1 is ready for release when:

- every must-have in section 2 is complete (TBD items have been decided and built)
- core user flows work end-to-end on mobile
- at least 50 quests are launch-ready in both English and Ukrainian
- GPS, map and route behaviour is reliable enough for real use in London
- Google and Apple sign-in work, and user data is kept correctly
- accessibility detail is present for every launch quest
- mobile QA is complete and release-blocking bugs are fixed
- production configuration has been checked

## 4. Explicitly post-V1 / deferred

| Deferred item | Why it is deferred |
|---|---|
| District-unlock progression | Not needed to discover or complete London quests |
| Expanded progression systems (levels, XP, tiers) | Adds complexity on top of the Passport, which already covers personal progress |
| Additional gamification layers and non-essential reward systems | Engagement extras, not launch requirements |
| Leaderboards / competitive progression | Not agreed. Competitive scoring also risks unwanted behaviour |
| Notifications | Deferred unless found to be required for release |
| Daily quest | Deferred unless confirmed as part of the agreed London V1 |
| Email/password sign-in, guest mode | V1 auth is Google + Apple only |
| Social feeds, messaging, friend challenges | Not part of V1 |
| Personalisation / AI recommendations | Not part of V1 |
| Monetisation, physical patch ordering | Not part of V1 |

**The V1 / post-V1 distinction for gamification:**

- **V1:** personal progress, meaning the Passport, collected stamps and the
  record of completed quests
- **Post-V1:** district unlocking, expanded progression and deeper gamification

These may help long-term engagement later, but users don't need them to
discover and complete London quests at launch.

## 5. Feature-creep rule

For every proposed feature, ask:

1. Does it directly support the V1 launch goal (section 1)?
2. Does a user need it to complete a core journey?
3. Does it fix a release-blocking usability, accessibility or reliability problem?
4. Is it needed for production or mobile release?

If every answer is no, the feature is **post-V1 by default**.

A feature can only be promoted into V1 on purpose, and this document must be
updated at the same time.

## 6. Scope area → V1 mapping

The active Jira epic list is not available in the repository, so each row
below is a provisional V1 scope area. See [Jira mapping follow-up](#9-jira-mapping-follow-up).

| V1 scope area | Jira epic | V1 status | Section | Notes |
|---|---|---|---|---|
| Real GPS | to confirm | Must-have | Location, maps and routes | Completion method TBD |
| Maps / routes | to confirm | Must-have | Location, maps and routes | Off-route handling and route to start: needs decision |
| 50+ quests | to confirm | Must-have | Core exploration | Content work, EN + UK |
| Authentication | to confirm | Must-have | Authentication | Google + Apple only |
| Accessibility detail | to confirm | Must-have | Accessibility and practical detail | Seven structured fields |
| Saved | to confirm | Must-have | Saved, Passport and Profile | Per-account persistence |
| Passport | to confirm | Must-have | Saved, Passport and Profile | Stamps and completed record. District unlocks are post-V1 |
| Profile | to confirm | Must-have | Saved, Passport and Profile | No new progression mechanics |
| Photos / POIs | to confirm | Must-have | Photos and POIs | POI data source TBD |
| Reviews | to confirm | Must-have | Reviews | Mechanics TBD |
| English / Ukrainian | to confirm | Must-have | Languages | Already partly built (MSc) |
| QA | to confirm | Must-have | QA | Release-blocking |
| Mobile release preparation | to confirm | Must-have | Mobile release preparation | Distribution method TBD |
| Gamification progression | to confirm | **Split** | Passport / Deferred | Passport and stamps → V1. District unlocks and expanded progression → Post-V1 |

**Existing MSc features outside the agreed areas**

| Item | Classification | Notes |
|---|---|---|
| Badge unlock art | Supporting (existing UI) | Part of the Passport. Not a separate V1 blocker |
| Report a Problem | Supporting (QA / release support) | Keep working; no new scope |
| Privacy Policy / Terms | Supporting (release preparation) | Must be updated for the real product |
| Location permissions screen | Supporting (Real GPS) | Part of the GPS permission messaging |
| Help & Safety, Contact Support, Settings | Supporting (existing UI) | Keep working; no new scope |
| Notifications screen | Post-V1 | Unless required for release |
| Daily quest | Post-V1 | Unless confirmed as part of the agreed London V1 |

## 7. Out of scope does not mean cancelled

Post-V1 means **intentionally deferred, not rejected**. Deferring protects the
launch while keeping these ideas for prioritisation after V1.

## 8. Scope change process

To promote something from post-V1 to V1:

1. Update this document by moving the item into section 2.
2. Note in one line why it is now launch-critical.
3. Map it to its Jira epic or task in section 6.
4. Consider what it affects: existing work, timeline and QA.

No formal approval step is needed. This is a small project.

## 9. Jira mapping follow-up

The repository currently has **no active Jira epic names**, and the Jira epic
list was not available when this document was written. The mapping in
section 6 uses the agreed V1 scope areas as provisional rows.

Once the Jira epic list is available:

- replace each "to confirm" with the real epic name and key
- map every active epic that is not listed yet to a must-have area, Supporting,
  Post-V1 or **Needs decision**
- split any epic that contains both V1 and post-V1 work, as shown for
  gamification above
