CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('dynamic-soft-delete', '0 0 * * *', 
  $$ UPDATE "Ad" 
     SET "deleted_at" = NOW() 
     WHERE "deleted_at" IS NULL 
     AND "created_at" < NOW() - ( "expires_in" || ' days' )::INTERVAL $$
);
