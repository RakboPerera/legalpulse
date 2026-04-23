import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const TABLES = {
  clients: { pk: 'client_id', prefix: 'CLI' },
  timekeepers: { pk: 'timekeeper_id', prefix: 'TK' },
  matters: { pk: 'matter_id', prefix: 'MAT' },
  fee_arrangements: { pk: 'arrangement_id', prefix: 'FA' },
  time_entries: { pk: 'entry_id', prefix: 'TE' },
  billing_invoices: { pk: 'invoice_id', prefix: 'INV' },
  budget_tracking: { pk: 'tracking_id', prefix: 'BT' },
  client_wallet_estimates: { pk: 'estimate_id', prefix: 'WE' },
  practice_coverage: { pk: 'coverage_id', prefix: 'PC' },
  market_signals: { pk: 'signal_id', prefix: 'MS' },
};

// Map raw SQLite error messages to user-friendly 400-level responses.
// Returns { status, error } where status is the HTTP code and error is
// a readable message suitable for surfacing in UI toasts.
function mapDbError(e) {
  const msg = (e && e.message) || String(e);
  if (/FOREIGN KEY constraint failed/i.test(msg)) {
    return { status: 400, error: 'Referenced record does not exist. Please pick a valid linked record (e.g. an existing client or matter).' };
  }
  if (/UNIQUE constraint failed/i.test(msg)) {
    const col = (msg.match(/UNIQUE constraint failed: [^.]+\.(\w+)/) || [])[1];
    return { status: 409, error: col ? `A record with this ${col} already exists.` : 'A record with these values already exists.' };
  }
  if (/NOT NULL constraint failed/i.test(msg)) {
    const col = (msg.match(/NOT NULL constraint failed: [^.]+\.(\w+)/) || [])[1];
    return { status: 400, error: col ? `Missing required field: ${col}.` : 'A required field is missing.' };
  }
  if (/CHECK constraint failed/i.test(msg)) {
    return { status: 400, error: 'One of the values does not meet the allowed options for its field.' };
  }
  if (/no such (table|column)/i.test(msg)) {
    return { status: 400, error: 'Unknown table or column in request.' };
  }
  // Unknown — keep the original for debugging but wrap as 500
  return { status: 500, error: `Server error: ${msg}` };
}

export function createDataRouter(db) {
  const router = Router();

  // List all tables with counts
  router.get('/tables', (req, res) => {
    try {
      const tables = Object.keys(TABLES).map(table => {
        const total = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get();
        const sample = db.prepare(`SELECT COUNT(*) as c FROM ${table} WHERE is_sample_data = 1`).get();
        return {
          name: table,
          total_rows: total?.c || 0,
          sample_rows: sample?.c || 0,
          user_rows: (total?.c || 0) - (sample?.c || 0),
        };
      });
      res.json(tables);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Get rows from a table with pagination
  router.get('/tables/:table', (req, res) => {
    const { table } = req.params;
    if (!TABLES[table]) return res.status(404).json({ error: 'Table not found' });

    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const offset = (page - 1) * limit;
      const filter = req.query.filter; // 'sample', 'user', or 'all'

      let where = '';
      if (filter === 'sample') where = 'WHERE is_sample_data = 1';
      else if (filter === 'user') where = 'WHERE is_sample_data = 0';

      const total = db.prepare(`SELECT COUNT(*) as c FROM ${table} ${where}`).get();
      const rows = db.prepare(`SELECT * FROM ${table} ${where} LIMIT ${limit} OFFSET ${offset}`).all();

      res.json({
        table, page, limit,
        total: total?.c || 0,
        rows,
      });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Add a row to a table
  router.post('/tables/:table', (req, res) => {
    const { table } = req.params;
    if (!TABLES[table]) return res.status(404).json({ error: 'Table not found' });

    try {
      const data = req.body;
      const pk = TABLES[table].pk;
      if (!data[pk]) {
        data[pk] = `${TABLES[table].prefix}_${uuidv4().slice(0, 8)}`;
      }
      data.is_sample_data = 0;

      const cols = Object.keys(data);
      const placeholders = cols.map(() => '?').join(',');
      const vals = cols.map(c => data[c]);

      db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`).run(...vals);
      res.json({ success: true, id: data[pk] });
    } catch (e) {
      const { status, error } = mapDbError(e);
      res.status(status).json({ error });
    }
  });

  // Update a row
  router.put('/tables/:table/:id', (req, res) => {
    const { table, id } = req.params;
    if (!TABLES[table]) return res.status(404).json({ error: 'Table not found' });

    try {
      const data = req.body;
      const pk = TABLES[table].pk;
      delete data[pk];
      delete data.is_sample_data;

      const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
      const vals = [...Object.values(data), id];

      db.prepare(`UPDATE ${table} SET ${sets} WHERE ${pk} = ?`).run(...vals);
      res.json({ success: true });
    } catch (e) {
      const { status, error } = mapDbError(e);
      res.status(status).json({ error });
    }
  });

  // Delete a row
  router.delete('/tables/:table/:id', (req, res) => {
    const { table, id } = req.params;
    if (!TABLES[table]) return res.status(404).json({ error: 'Table not found' });

    try {
      const pk = TABLES[table].pk;
      db.prepare(`DELETE FROM ${table} WHERE ${pk} = ?`).run(id);
      res.json({ success: true });
    } catch (e) {
      const { status, error } = mapDbError(e);
      res.status(status).json({ error });
    }
  });

  // Delete all sample data from a specific table
  router.delete('/sample-data/:table', (req, res) => {
    const { table } = req.params;
    if (!TABLES[table]) return res.status(404).json({ error: 'Table not found' });

    try {
      db.prepare(`DELETE FROM ${table} WHERE is_sample_data = 1`).run();
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Delete ALL sample data from all tables
  router.delete('/sample-data', (req, res) => {
    try {
      // Delete in reverse dependency order
      const order = ['market_signals', 'practice_coverage', 'client_wallet_estimates', 'budget_tracking', 'billing_invoices', 'time_entries', 'fee_arrangements', 'matters', 'timekeepers', 'clients'];
      for (const table of order) {
        db.prepare(`DELETE FROM ${table} WHERE is_sample_data = 1`).run();
      }
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
}
