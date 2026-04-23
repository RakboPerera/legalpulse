export function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      client_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      size_band TEXT,
      country TEXT DEFAULT 'UK',
      annual_revenue REAL,
      relationship_partner TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS timekeepers (
      timekeeper_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      practice_area TEXT NOT NULL,
      standard_rate REAL NOT NULL,
      cost_rate REAL NOT NULL,
      seniority_years INTEGER,
      status TEXT NOT NULL DEFAULT 'Active',
      is_sample_data INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS matters (
      matter_id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      matter_name TEXT NOT NULL,
      matter_type TEXT NOT NULL,
      practice_area TEXT NOT NULL,
      fee_arrangement TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      open_date TEXT NOT NULL,
      close_date TEXT,
      budget_amount REAL,
      budget_hours REAL,
      responsible_partner TEXT,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(client_id)
    );

    CREATE TABLE IF NOT EXISTS fee_arrangements (
      arrangement_id TEXT PRIMARY KEY,
      matter_id TEXT NOT NULL,
      arrangement_type TEXT NOT NULL,
      fixed_amount REAL,
      cap_amount REAL,
      discount_pct REAL,
      billing_cycle TEXT,
      notes TEXT,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (matter_id) REFERENCES matters(matter_id)
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      entry_id TEXT PRIMARY KEY,
      matter_id TEXT NOT NULL,
      timekeeper_id TEXT NOT NULL,
      date TEXT NOT NULL,
      hours_worked REAL NOT NULL,
      hours_billed REAL NOT NULL,
      narrative TEXT,
      rate_applied REAL NOT NULL,
      amount REAL NOT NULL,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (matter_id) REFERENCES matters(matter_id),
      FOREIGN KEY (timekeeper_id) REFERENCES timekeepers(timekeeper_id)
    );

    CREATE TABLE IF NOT EXISTS billing_invoices (
      invoice_id TEXT PRIMARY KEY,
      matter_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      gross_amount REAL NOT NULL,
      write_off REAL DEFAULT 0,
      write_down REAL DEFAULT 0,
      net_billed REAL NOT NULL,
      amount_collected REAL DEFAULT 0,
      collection_date TEXT,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (matter_id) REFERENCES matters(matter_id),
      FOREIGN KEY (client_id) REFERENCES clients(client_id)
    );

    CREATE TABLE IF NOT EXISTS budget_tracking (
      tracking_id TEXT PRIMARY KEY,
      matter_id TEXT NOT NULL,
      period TEXT NOT NULL,
      budgeted_hours REAL NOT NULL,
      actual_hours REAL NOT NULL,
      budgeted_amount REAL NOT NULL,
      actual_amount REAL NOT NULL,
      cumulative_budget_consumed_pct REAL NOT NULL,
      estimated_completion_pct REAL,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (matter_id) REFERENCES matters(matter_id)
    );

    CREATE TABLE IF NOT EXISTS client_wallet_estimates (
      estimate_id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      period TEXT NOT NULL,
      estimated_total_legal_spend REAL NOT NULL,
      estimation_method TEXT NOT NULL,
      confidence TEXT NOT NULL,
      our_revenue REAL NOT NULL,
      share_of_wallet_pct REAL,
      data_source_notes TEXT,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(client_id)
    );

    CREATE TABLE IF NOT EXISTS practice_coverage (
      coverage_id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      practice_area TEXT NOT NULL,
      served_by_us INTEGER NOT NULL DEFAULT 0,
      estimated_client_spend REAL,
      known_competitor TEXT,
      source TEXT,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(client_id)
    );

    CREATE TABLE IF NOT EXISTS market_signals (
      signal_id TEXT PRIMARY KEY,
      client_id TEXT,
      signal_date TEXT NOT NULL,
      signal_type TEXT NOT NULL,
      source TEXT NOT NULL,
      content TEXT NOT NULL,
      competitor TEXT,
      severity TEXT,
      is_sample_data INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (client_id) REFERENCES clients(client_id)
    );
  `);
}
