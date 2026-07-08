# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 1.1.0

### Added
- Reestruturação em monorepo separando Frontend (Next.js) e Backend (NestJS).
- Criação do Game Engine via WebSockets (Socket.io) para comunicação em tempo real.
- Integração do PostgreSQL via TypeORM no backend.
- Automação via Docker Compose e criação dos scripts `risk-setup.sh` e `risk-start.sh`.
- Configuração de build Standalone no Next.js para otimização de imagem Docker.

### Fixed
- Correção de roteamento do `next-intl` na raiz `/` (middleware redirect).

## 1.0.1

### Changed

- Updated Next.js version to 16.1.4
- Updated AGENTS.md file

## 1.0.0

### Added

- Internacionalization for English and Brazilian Portuguese languages
- Switch language component
- Changelog