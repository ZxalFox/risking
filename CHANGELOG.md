# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.4.0

### Added
- Rebuilt the Game Board UI (`room.status === "playing"`) adhering to the `DESIGN.md` guidelines.
- `Card.tsx` updated with the new brand colors (`risk-primary`, `mitigation-primary`), dark mode themes, and responsive hover/selection animations.
- Strict Defense Logic implemented in the Backend (`game.service.ts`), deprecating the "MVP Simulated" verbal defense. Players must now use a valid Mitigation card with a matching category to defend successfully.
- Added `isCreator` boolean to `PlayerEntity` in PostgreSQL to persistently track the room host, even across connection drops or server restarts.

### Changed
- Refactored `page.tsx` game UI to remove the "Explicar Mitigação" mock button.
- Refactored the 'My Hand' and 'Opponents' sidebar to use dark themes and transluscent overlays (`backdrop-blur`).

### Fixed
- Fixed a bug where a player drawing duplicate Risk Cards caused a React Key collision (`Encountered two children with the same key`), leading to multiple cards being visually selected simultaneously. Cards are now uniquely mapped with their array index.
## 1.3.0

### Added
- Rebuilt the Lobby (Waiting Room) UI adhering to the `DESIGN.md` guidelines.
- Added host vs player visual distinctions and conditional "Start Game" rendering.
- Implemented `leaveRoom` socket event in `GameGateway` (Backend) to handle player disconnections safely.
- Implemented `leaveRoom` function in `GameContext` (Frontend) to manage local state reset.
- Added `Lobby` and `Game` translation namespaces in `pt-BR.json` and `en.json`.

### Changed
- Removed legacy `Lobby.tsx` component as its functionality is now split between Login and Room pages.

### Fixed
- Fixed bug where `roomId` inputs were strictly lowercase in the UI causing mismatch with the Backend uppercase hashes ("Room not found" error).
- Fixed `LocaleSwitcher` overlapping page content during scroll by moving it from a fixed position to the static document flow.
## 1.2.0

### Added
- Rebuilt the Login/Landing page adhering strictly to the `DESIGN.md` guidelines.
- Dynamic responsive `LocaleSwitcher` component with an elegant dark-theme styling.
- Configured custom brand colors (`risk-primary`, `mitigation-primary`) in `tailwind.config.ts`.
- Integrated `GameContext` directly into the Login page for seamless room creation and joining.
- Client-side dynamic network address resolution for WebSockets (`GameContext`).

### Changed
- Removed boilerplate translations and added game-specific ones to `pt-BR.json` and `en.json`.
## 1.1.0

### Added
- Monorepo restructure separating Frontend (Next.js) and Backend (NestJS).
- Game Engine over WebSockets (Socket.io) for real-time communication.
- PostgreSQL integration via TypeORM in the backend.
- Docker Compose automation and creation of `risk-setup.sh` and `risk-start.sh` helper scripts.
- Next.js Standalone build configuration for Docker image optimization.

### Fixed
- Fixed `next-intl` routing redirect issue at the root path `/` (middleware configuration).

## 1.0.1

### Changed

- Updated Next.js version to 16.1.4
- Updated AGENTS.md file

## 1.0.0

### Added

- Internacionalization for English and Brazilian Portuguese languages
- Switch language component
- Changelog