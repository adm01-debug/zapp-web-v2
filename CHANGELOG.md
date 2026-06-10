# Changelog

All notable changes to ZAPP-WEB will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed (rodada 10/10 — 2026-06-10)
- **SSOCallback:** timeout de 10s lia `status` por closure obsoleta (podia exibir
  "Tempo esgotado" após login OK); listener de auth nunca era desinscrito
  (cleanup retornado de função interna, não do efeito); timeouts sem cleanup
- **useAudioRecorder:** corte automático no tempo máximo nunca disparava
  (`stopRecording` capturado pelo setInterval com `isRecording` obsoleto);
  agora usa o estado do MediaRecorder como fonte da verdade
- **AnimatedCounter:** `prevRef` era objeto literal recriado a cada render
  (não `useRef`) — a animação sempre recomeçava do zero
- **ViewRouter:** props de navegação congeladas no useMemo (breadcrumb/voltar
  obsoletos); **ChatInputArea:** handlers de menu fora das deps do useMemo
- **useChatSearch:** callback de prop podia executar versão obsoleta (ref)

### Changed (rodada 10/10 — 2026-06-10)
- **ESLint zerado de verdade: 0 erros e 0 avisos** (eram 723 problemas).
  exhaustive-deps: 82→0 (correções reais + intenção documentada caso a caso);
  edge functions Deno tipadas (`SupabaseClient` central em `deno-types.ts`,
  payloads Gmail/Evolution com interfaces mínimas)
- **Bundle do chat 90% menor:** mapbox-gl (~1 MB) saiu do caminho crítico —
  `LocationMessage` agora é lazy (chunk só carrega ao receber localização);
  ChatPanel: 1,8 MB → 176 KB
- **Suíte de simulação massiva** (`scenario-simulation.test.ts`): ~3.500
  cenários gerados com seed determinística validando invariantes (limites,
  monotonicidade, segurança XSS do renderizador WhatsApp, fuzz de classificação)

### Fixed (auditoria de QA — 2026-06-10)
- **CI quebrado:** `ci.yml` e `supabase-sync.yml` eram YAML inválido (bloco colado
  antes do header) — nenhum workflow rodava; reconstruídos e migrados para Bun
  (`npm ci` falhava sem `package-lock.json`)
- **bun.lock irreproduzível:** 331 URLs apontavam para o registry privado do
  sandbox Lovable (HTTP 403 fora dele); trocadas pelo registry público npmjs
- **useQueues:** `waiting_count` estava fixo em 0 (cálculo perdido em refactor);
  contagem de contatos aguardando atribuição restaurada via `QueueService`
- **ContactForm:** cargo atual desaparecia do Select quando ausente da lista
  externa de cargos
- **Rules of Hooks:** `useTransform` chamado condicionalmente em
  `mobile-components.tsx` (PullToRefresh)
- **useSpeechToText:** tipos da Web Speech API ausentes quebravam `tsc`
- **Testes:** 9 falhas e 1 worker travado corrigidos — mock instável do
  `StoryViewer` causava loop infinito de render (suíte caiu de ~58min para ~90s);
  env dummy do Supabase para suites que importam o client real; mocks
  sincronizados com os contratos atuais dos hooks
- **.env.example/README:** `VITE_SUPABASE_PUBLISHABLE_KEY` (nome real lido pelo
  client) no lugar de `VITE_SUPABASE_ANON_KEY`; comandos de teste corrigidos
- **jspdf-autotable:** ^5.0.8 (5.0.2 declarava peer incompatível com jspdf 4)

### Changed (auditoria de QA — 2026-06-10)
- ESLint estratificado por ambiente (app, testes/mocks, Edge Functions Deno);
  489 erros de lint zerados; testes tautológicos de Churn/Tickets/Performance
  reescritos contra a lógica real extraída para módulos puros testáveis
  (`churnRisk.ts`, `ticketClassification.ts`, `metricThresholds.ts`)
- Tipagens de produção sem `any`: payloads realtime, navegação, evolution hooks
  (alias central `EvolutionApiResponse`), `DialogKey` unificado em módulo único

### Removed (auditoria de QA — 2026-06-10)
- 167 módulos órfãos (inalcançáveis a partir de `main.tsx`) + 24 suítes que
  testavam exclusivamente código morto
- Dependências sem uso: react-hook-form, @hookform/resolvers, radix
  aspect-ratio/hover-card/menubar/navigation-menu, embla-carousel-react,
  input-otp, next-themes, react-resizable-panels, vaul, serialize-javascript,
  caniuse-lite, baseline-browser-mapping, vite-plugin-pwa, tsx,
  @vitejs/plugin-react-swc
- Fantasmas: `tmp/`, `HANDOFF_MISSION_10-10.md`, `generate_audit_pdf.ts`,
  `docs/audit_report.pdf` (gerado), `performance-budget.json` (sem consumidor),
  job de CI que commitava PDF estático na main

### Added
- CI/CD Pipeline with GitHub Actions (`ci.yml`)
- Dependabot configuration for automated dependency updates
- EditorConfig for consistent coding styles across editors
- Prettier configuration for code formatting
- MIT License
- Node.js version management via .nvmrc (v20 LTS)
- Issue and PR templates
- VS Code settings for team consistency
- CONTRIBUTING.md guide
- SECURITY.md policy
- docs/DEPLOYMENT.md - Complete deployment guide
- docs/TROUBLESHOOTING.md - Problem-solving guide
- RLS_MIGRATION_INSTRUCTIONS.md - Security migration guide
- Comprehensive .env.example with all environment variables

### Changed
- Repository structure cleanup (removed 24+ redundant files, ~24.5MB freed)
- README.md updated with badges (CI, TypeScript, React, Supabase, License)
- docs/README.md updated with full documentation index
- useEvolutionApi hook refactored into 5 sub-hooks for better maintainability

### Security
- **RLS Audit:** Migration created to fix 10+ policies with `USING(true)`
  - Tables affected: entity_versions, email_threads, email_messages, email_attachments, whatsapp_connection_queues
  - Migration file: `supabase/migrations/20260412230000_fix_rls_policies_security.sql`
  - **Status: Pending application**
- Enhanced .gitignore with credential pattern blocking (PT-BR and EN)
- CODEOWNERS for mandatory code review
- Zero hardcoded credentials verified

### Documentation
- TECHNICAL_DOCUMENTATION.md (90KB)
- COMPLETE_SYSTEM_FEATURES.md (45KB)
- EVOLUTION_API_REFERENCE.md (38KB)
- Architecture Decision Records (ADRs)
- Runbooks for incident response
- LGPD retention policy
- Backup and recovery strategy

### Removed
- All Lalamove-related files from repository root
- Redundant package-lock.json (project uses bun.lock)
- MCP test files
- Exposed credentials files

---

## [1.0.0] - 2024-XX-XX

### Added
- Initial release of ZAPP-WEB
- Multi-channel WhatsApp CRM platform
- RBAC (Admin, Supervisor, Agent roles)
- WebAuthn/Passkeys authentication
- MFA/TOTP support
- Real-time messaging via Evolution API
- AI-powered sentiment analysis
- Gamification system with XP and achievements
- CRM Intelligence (DISC profiling, RFM segmentation)
- PWA support
- 56 database tables with 181 RLS policies
- 20 Edge Functions (4,598 lines)
- 297 React components in 35 folders
- 80 custom hooks

### Technical Stack
- React 18.3.1 + Vite 5 + TypeScript
- Supabase (PostgreSQL + Realtime + Edge Functions)
- shadcn/ui + Tailwind CSS
- Evolution API for WhatsApp
- OpenAI + ElevenLabs for AI features
- Mapbox for geolocation
- Resend for email

[Unreleased]: https://github.com/adm01-debug/zapp-web/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/adm01-debug/zapp-web/releases/tag/v1.0.0
