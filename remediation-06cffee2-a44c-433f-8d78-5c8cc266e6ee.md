# Remediation Plan for Incident 06cffee2-a44c-433f-8d78-5c8cc266e6ee

**Root Cause:**
PostgreSQL connection pool exhausted (max 100)

**Fix:**
Increase the max connections in pgbouncer or database config and restart the service.
