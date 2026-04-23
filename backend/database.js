import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'legalpulse.db');

class DatabaseWrapper {
  constructor(db) {
    this.db = db;
  }

  prepare(sql) {
    const db = this.db;
    return {
      run(...params) {
        db.run(sql, params);
        const lastId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
        const changes = db.getRowsModified();
        saveToDisk(db);
        return { lastInsertRowid: lastId, changes };
      },
      get(...params) {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        let row = undefined;
        if (stmt.step()) {
          const cols = stmt.getColumnNames();
          const vals = stmt.get();
          row = {};
          cols.forEach((c, i) => row[c] = vals[i]);
        }
        stmt.free();
        return row;
      },
      all(...params) {
        const stmt = db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        const rows = [];
        const cols = stmt.getColumnNames ? stmt.getColumnNames() : [];
        while (stmt.step()) {
          const vals = stmt.get();
          const row = {};
          // getColumnNames may not be populated until after first step
          const colNames = stmt.getColumnNames();
          colNames.forEach((c, i) => row[c] = vals[i]);
          rows.push(row);
        }
        stmt.free();
        return rows;
      }
    };
  }

  exec(sql) {
    this.db.exec(sql);
    saveToDisk(this.db);
  }

  execRead(sql) {
    return this.db.exec(sql);
  }

  save() {
    saveToDisk(this.db);
  }
}

function saveToDisk(db) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    // sql.js's export() closes and re-opens the internal connection, which
    // silently resets PRAGMAs (including foreign_keys). Re-enable FK
    // enforcement so the next operation still honours it.
    db.exec('PRAGMA foreign_keys = ON');
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

export async function getDb() {
  const SQL = await initSqlJs();
  let db;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  // Enable foreign key enforcement. SQLite has this off by default — we need it
  // on so FK constraint violations are raised (and mapped to friendly errors
  // in data.js). Existing rows are NOT re-validated, so this is safe to add
  // after seeding.
  db.exec('PRAGMA foreign_keys = ON');
  return new DatabaseWrapper(db);
}
