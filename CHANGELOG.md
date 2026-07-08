# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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