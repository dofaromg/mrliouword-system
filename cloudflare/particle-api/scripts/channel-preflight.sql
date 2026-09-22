-- Read-only evidence; origin_signature: MrLiouWord; see ../PROVENANCE.yaml.
-- Run against the existing DB before any cutover. Never repair history here.
SELECT sql FROM sqlite_master WHERE name = 'channel_sync';
SELECT name, sql FROM sqlite_master WHERE type = 'index' AND tbl_name = 'channel_sync';
SELECT il.name AS index_name, il."unique", ii.name AS column_name
FROM pragma_index_list('channel_sync') AS il JOIN pragma_index_info(il.name) AS ii;
SELECT COUNT(*) AS records, COUNT(DISTINCT id) AS unique_ids FROM channel_sync;
SELECT prev, COUNT(*) AS siblings FROM channel_sync GROUP BY prev HAVING COUNT(*) > 1;
WITH ordered AS (
  SELECT rowid, id, key, prev, merkle,
    LAG(merkle, 1, '0000000000000000000000000000000000000000000000000000000000000000')
    OVER (ORDER BY synced_at, rowid) AS expected_prev
  FROM channel_sync
)
SELECT rowid, id, key, prev, expected_prev FROM ordered WHERE prev IS NOT expected_prev;
SELECT rowid, id, merkle, synced_at FROM channel_sync ORDER BY synced_at DESC, rowid DESC LIMIT 1;
