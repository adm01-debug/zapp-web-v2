-- Migration: pg_cron cleanup for evolution_webhook_events_* tables
-- Date: 2026-06-12
-- Context:
--   25 per-instance tables (evolution_webhook_events_<slug>) accumulate
--   processed webhook events indefinitely. No cleanup job existed.
--   Largest tables: wpp2 (134 MB), wpp_pink_test (50 MB).
--   All other purge jobs (webhook_audit_log, realtime_events, etc.) already
--   existed — this was the only gap.
--
-- Strategy:
--   - Delete only rows where processed = true (never touch unprocessed events)
--   - Retention: 30 days (configurable via p_retention_days parameter)
--   - Batch size: 5000 rows per table per run (avoids long locks)
--   - Dynamic loop: covers all current and future _<instance> tables
--   - Schedule: daily at 03:30 UTC (off-peak, after other purge jobs at 03:00-04:45)
--   - Returns jsonb with per-table and total deleted counts for observability

CREATE OR REPLACE FUNCTION public.fn_purge_processed_webhook_events(
  p_retention_days integer DEFAULT 30,
  p_batch_size     integer DEFAULT 5000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_table  text;
  v_sql    text;
  v_count  bigint;
  v_total  bigint := 0;
  v_result jsonb  := '{}'::jsonb;
BEGIN
  FOR v_table IN
    SELECT tablename
    FROM   pg_tables
    WHERE  schemaname = 'public'
      AND  tablename  LIKE 'evolution_webhook_events%'
    ORDER  BY tablename
  LOOP
    v_sql := format(
      $q$
        WITH deleted AS (
          DELETE FROM public.%I
          WHERE processed = true
            AND created_at < NOW() - INTERVAL '1 day' * $1
            AND ctid IN (
              SELECT ctid FROM public.%I
              WHERE processed = true
                AND created_at < NOW() - INTERVAL '1 day' * $1
              LIMIT $2
            )
          RETURNING 1
        )
        SELECT count(*) FROM deleted
      $q$,
      v_table, v_table
    );
    EXECUTE v_sql USING p_retention_days, p_batch_size INTO v_count;
    v_total := v_total + v_count;
    IF v_count > 0 THEN
      v_result := v_result || jsonb_build_object(v_table, v_count);
    END IF;
  END LOOP;

  v_result := v_result || jsonb_build_object('_total_deleted', v_total);
  RETURN v_result;
END;
$$;

-- Register pg_cron job (idempotent: unschedule first if it already exists)
SELECT cron.unschedule('purge-processed-webhook-events');
SELECT cron.schedule(
  'purge-processed-webhook-events',
  '30 3 * * *',  -- 03:30 UTC daily (after cleanup-old-notifications at 03:00)
  $$SELECT public.fn_purge_processed_webhook_events(30, 5000)$$
);

-- To run manually (e.g. one-off cleanup):
-- SELECT public.fn_purge_processed_webhook_events(30, 10000);
