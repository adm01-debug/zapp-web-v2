# ADR-001 — Per-Instance Webhook Event Tables Pattern

**Status:** Accepted (documenting existing design)  
**Date:** 2026-06-12  
**Author:** Refactoring Agent  

---

## Context

The Evolution API sends webhook events for every connected WhatsApp instance.
Rather than routing all events into a single shared table, the current design
creates one table per instance following the naming convention:

```
evolution_webhook_events_<instance_slug>
```

### Current inventory (2026-06-12)

| Table | Total size | Data size | Notes |
|---|---|---|---|
| `evolution_webhook_events` | 0 B | 0 B | **Canonical schema** — base DDL reference |
| `evolution_webhook_events_wpp2` | **134 MB** | 18.7 MB | Primary production instance |
| `evolution_webhook_events_wpp_pink_test` | **50 MB** | 19.1 MB | Test / staging instance |
| `evolution_webhook_events_default` | 200 KB | 112 KB | Default webhook receiver |
| `evolution_webhook_events_comercial_01` … `_15` | 32 KB each | 0 | Comercial fleet — currently empty |
| `evolution_webhook_events_artes` | 32 KB | 0 | — |
| `evolution_webhook_events_compras` | 40 KB | 0 | — |
| `evolution_webhook_events_financeiro` | 40 KB | 0 | — |
| `evolution_webhook_events_gravacao` | 32 KB | 0 | — |
| `evolution_webhook_events_logistica` | 40 KB | 0 | — |
| `evolution_webhook_events_marketing` | 40 KB | 0 | — |

**Total:** 25 tables, identical schema.

### Shared schema (all 25 tables)

```sql
id             uuid NOT NULL
event_type     text NOT NULL
instance_name  text NOT NULL
remote_jid     text
from_me        boolean
message_type   text
push_name      text
payload        jsonb NOT NULL
processed      boolean
processed_at   timestamptz
error_message  text
created_at     timestamptz
status         webhook_event_status NOT NULL  -- USER-DEFINED enum
```

Typical indexes (wpp2 as reference):
- `(id, instance_name)` — composite PK
- `(event_type, processed)` — processing queue filter
- `(event_type)` — single-column variant
- `(status, created_at DESC)` — status dashboard queries
- `(created_at DESC)` — time-range scans

---

## Decision

**We keep the per-instance table pattern** for now.

### Rationale

1. **Row-level isolation** — a bug or heavy load on one instance cannot lock or
   degrade other instances. Each table is an independent I/O unit.

2. **Simpler RLS / access control** — Supabase Row Level Security policies can
   be applied per-table instead of requiring a `WHERE instance_name = $1`
   predicate on every query.

3. **Operational simplicity** — DDL-level operations (VACUUM, REINDEX, TRUNCATE,
   DROP) can target a single instance without touching others.

4. **Current scale is manageable** — only two tables hold meaningful data
   (~134 MB + ~50 MB). Remaining 23 tables are empty shells.

---

## Consequences

### Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Schema drift — future migrations must be applied to **all 25 tables** | High | See recommendation below |
| New instance requires manual `CREATE TABLE ... LIKE` | Medium | See recommendation below |
| Cross-instance analytics require `UNION ALL` queries | Medium | Create a view (see below) |
| Orphan tables when an instance is deleted | Low | Document decommission process |

### Recommendations (future work — NOT part of this ADR)

1. **Migration helper function** — create a SQL procedure that applies any DDL
   change to all `evolution_webhook_events_%` tables atomically:
   ```sql
   -- Example pattern (implement in a future migration)
   DO $$
   DECLARE tbl text;
   BEGIN
     FOR tbl IN
       SELECT tablename FROM pg_tables
       WHERE schemaname = 'public'
         AND tablename LIKE 'evolution_webhook_events_%'
         AND tablename != 'evolution_webhook_events'  -- skip base template
     LOOP
       EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS ...', tbl);
     END LOOP;
   END $$;
   ```

2. **Unified view** — for cross-instance analytics:
   ```sql
   -- Implement as a future migration
   CREATE OR REPLACE VIEW evolution_webhook_events_all AS
     SELECT *, 'wpp2' AS _source FROM evolution_webhook_events_wpp2
     UNION ALL
     SELECT *, 'wpp_pink_test' AS _source FROM evolution_webhook_events_wpp_pink_test
     UNION ALL
     SELECT *, 'default' AS _source FROM evolution_webhook_events_default;
   ```

3. **Provisioning script** — automate `CREATE TABLE ... LIKE` + `CREATE INDEX`
   when a new Evolution instance is registered, instead of doing it manually.

4. **Consolidation** — if the instance count exceeds ~50 or cross-instance
   queries become frequent, consider migrating to a single partitioned table:
   ```sql
   -- Future: partition by instance_name using pg_partman
   CREATE TABLE evolution_webhook_events_unified (
     LIKE evolution_webhook_events INCLUDING ALL
   ) PARTITION BY LIST (instance_name);
   ```
   This would eliminate schema drift and allow `UNION ALL` views to be
   replaced by direct table queries.

---

## References

- `supabase/functions/_shared/evolution-webhook-handlers.ts` — handler that
  routes to per-instance tables at runtime
- `supabase/functions/_shared/evolution-helpers.ts` — instance cache (5 min TTL)
- ADR-002 — pg_partman strategy for `evolution_messages_wpp2`
