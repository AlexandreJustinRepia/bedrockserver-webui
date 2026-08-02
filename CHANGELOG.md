# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-08-02

### Added
- Console page with live server output and command input
- Command autocomplete for 50+ Bedrock server commands
- Players page with allowlist management
- Online player status indicators with real-time polling
- Configs page for editing server.properties
- Dark / light mode toggle with localStorage persistence
- Sticky navbar with Minecraft Bedrock logo
- Responsive bento-grid card layouts
- Custom scrollbar for console output
- Developer footer credit
- Desktop one-click launcher (start-webui.bat)
- WebSocket real-time console streaming
- External server process detection and control
- State persistence across page refreshes

### Changed
- Migrated from dark-only theme to warm monochrome light/dark theme
- Updated design to follow minimalist editorial protocol
- Replaced emoji icons with minimal SVG icons
- Improved console button states (Start/Stop only)

### Fixed
- Double `/api` prefix bug in backend routes
- Backend port conflict handling
- Console log retention across refreshes
- Command sending without `/` prefix to avoid Bedrock errors

## [0.1.0] - 2026-08-02

### Added
- Initial project setup
- Basic React + Vite + Tailwind CSS structure
- Express + WebSocket backend
- Server start/stop functionality
- Basic player allowlist CRUD
- Server properties editor
- Addon management page (later removed)
