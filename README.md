# 🦜️🔗 Chat over SQL

# Setup

First, bootstrap the DB and a readonly user that the LLM will use to run generated queries:

```sql
psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -f bootstrap.sql

psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -c "CREATE ROLE llm WITH LOGIN PASSWORD '<YOUR_PASSWORD>';"

psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -c "GRANT CONNECT ON DATABASE <DB_NAME> TO llm;"

psql postgres://<USERNAME>:<PASSWORD>@<HOSTNAME>/<DB_NAME> -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO llm;"
```

You can modify the last step to only give read access to certain tables, as well as allow insert/update access
to specific tables, if desired.
