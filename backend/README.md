Run 

```sql
INSERT INTO models (id, name, description, owner_id, created_at, updated_at, task, size, uri, derived_from_id) VALUES (1, 'FirstModel', NULL, 0, NOW(), NOW(), 'tabular_classification',0, NULL, 1) RETURNING models.id;
```
in the dbbefore using the app because at least one model is reqired