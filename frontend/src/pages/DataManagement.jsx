import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import InfoTooltip from '../components/InfoTooltip';
import { Database, Plus, Trash2, Save, X, Edit3, Check } from 'lucide-react';

const TABLE_META = {
  clients: {
    label: 'Clients', group: 'Core Reference',
    description: 'Client entity records with industry, size, and relationship partner.',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true, auto: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'industry', label: 'Industry', type: 'select', required: true, options: ['Financial Services','Technology','Manufacturing','Healthcare','Energy','Retail','Real Estate','Professional Services','Government','Other'] },
      { key: 'size_band', label: 'Size Band', type: 'select', options: ['Small','Mid-Market','Large','Enterprise'] },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'annual_revenue', label: 'Annual Revenue (£)', type: 'number' },
      { key: 'relationship_partner', label: 'Relationship Partner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active','Inactive','Prospect'] },
    ]
  },
  timekeepers: {
    label: 'Timekeepers', group: 'Core Reference',
    description: 'Lawyers and staff with billing rates and cost rates.',
    fields: [
      { key: 'timekeeper_id', label: 'Timekeeper ID', type: 'text', required: true, auto: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'role', label: 'Role', type: 'select', required: true, options: ['Partner','Senior Associate','Associate','Paralegal','Trainee'] },
      { key: 'practice_area', label: 'Practice Area', type: 'select', required: true, options: ['Corporate/M&A','Litigation & Disputes','Employment','Real Estate','Regulatory & Compliance'] },
      { key: 'standard_rate', label: 'Standard Rate (£/hr)', type: 'number', required: true },
      { key: 'cost_rate', label: 'Cost Rate (£/hr)', type: 'number', required: true },
      { key: 'seniority_years', label: 'Seniority (years)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: ['Active','Inactive'] },
    ]
  },
  matters: {
    label: 'Matters', group: 'Core Reference',
    description: 'Active and historical legal engagements with budgets and fee arrangements.',
    fields: [
      { key: 'matter_id', label: 'Matter ID', type: 'text', required: true, auto: true },
      { key: 'client_id', label: 'Client', type: 'text', required: true, fk: { table: 'clients', idKey: 'client_id', labelKey: 'name' } },
      { key: 'matter_name', label: 'Matter Name', type: 'text', required: true },
      { key: 'matter_type', label: 'Matter Type', type: 'text', required: true },
      { key: 'practice_area', label: 'Practice Area', type: 'select', required: true, options: ['Corporate/M&A','Litigation & Disputes','Employment','Real Estate','Regulatory & Compliance'] },
      { key: 'fee_arrangement', label: 'Fee Arrangement', type: 'select', required: true, options: ['Hourly','Fixed Fee','Capped Fee','Contingent','Blended'] },
      { key: 'status', label: 'Status', type: 'select', required: true, options: ['Open','Closed'] },
      { key: 'open_date', label: 'Open Date', type: 'date', required: true },
      { key: 'close_date', label: 'Close Date', type: 'date' },
      { key: 'budget_amount', label: 'Budget (£)', type: 'number' },
      { key: 'budget_hours', label: 'Budget Hours', type: 'number' },
      { key: 'responsible_partner', label: 'Responsible Partner', type: 'text' },
    ]
  },
  fee_arrangements: {
    label: 'Fee Arrangements', group: 'Core Reference',
    description: 'Commercial terms per matter — fixed fees, caps, discounts.',
    fields: [
      { key: 'arrangement_id', label: 'Arrangement ID', type: 'text', required: true, auto: true },
      { key: 'matter_id', label: 'Matter', type: 'text', required: true, fk: { table: 'matters', idKey: 'matter_id', labelKey: 'matter_name' } },
      { key: 'arrangement_type', label: 'Type', type: 'select', required: true, options: ['Hourly','Fixed Fee','Capped Fee','Contingent','Blended'] },
      { key: 'fixed_amount', label: 'Fixed Amount (£)', type: 'number' },
      { key: 'cap_amount', label: 'Cap Amount (£)', type: 'number' },
      { key: 'discount_pct', label: 'Discount %', type: 'number' },
      { key: 'billing_cycle', label: 'Billing Cycle', type: 'select', options: ['Monthly','Quarterly','On Completion','Milestone'] },
      { key: 'notes', label: 'Notes', type: 'text' },
    ]
  },
  time_entries: {
    label: 'Time Entries', group: 'Transactional',
    description: 'Individual time records: hours worked, hours billed, rates, and narratives.',
    fields: [
      { key: 'entry_id', label: 'Entry ID', type: 'text', required: true, auto: true },
      { key: 'matter_id', label: 'Matter', type: 'text', required: true, fk: { table: 'matters', idKey: 'matter_id', labelKey: 'matter_name' } },
      { key: 'timekeeper_id', label: 'Timekeeper', type: 'text', required: true, fk: { table: 'timekeepers', idKey: 'timekeeper_id', labelKey: 'name' } },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'hours_worked', label: 'Hours Worked', type: 'number', required: true },
      { key: 'hours_billed', label: 'Hours Billed', type: 'number', required: true },
      { key: 'narrative', label: 'Narrative', type: 'text' },
      { key: 'rate_applied', label: 'Rate (£/hr)', type: 'number', required: true },
      { key: 'amount', label: 'Amount (£)', type: 'number', required: true },
    ]
  },
  billing_invoices: {
    label: 'Billing & Invoices', group: 'Transactional',
    description: 'Invoice records with gross amounts, write-offs, write-downs, and collections.',
    fields: [
      { key: 'invoice_id', label: 'Invoice ID', type: 'text', required: true, auto: true },
      { key: 'matter_id', label: 'Matter', type: 'text', required: true, fk: { table: 'matters', idKey: 'matter_id', labelKey: 'matter_name' } },
      { key: 'client_id', label: 'Client', type: 'text', required: true, fk: { table: 'clients', idKey: 'client_id', labelKey: 'name' } },
      { key: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
      { key: 'gross_amount', label: 'Gross Amount (£)', type: 'number', required: true },
      { key: 'write_off', label: 'Write-Off (£)', type: 'number' },
      { key: 'write_down', label: 'Write-Down (£)', type: 'number' },
      { key: 'net_billed', label: 'Net Billed (£)', type: 'number', required: true },
      { key: 'amount_collected', label: 'Collected (£)', type: 'number' },
      { key: 'collection_date', label: 'Collection Date', type: 'date' },
    ]
  },
  budget_tracking: {
    label: 'Budget Tracking', group: 'Transactional',
    description: 'Budget vs. actual by matter and period, with completion estimates.',
    fields: [
      { key: 'tracking_id', label: 'Tracking ID', type: 'text', required: true, auto: true },
      { key: 'matter_id', label: 'Matter', type: 'text', required: true, fk: { table: 'matters', idKey: 'matter_id', labelKey: 'matter_name' } },
      { key: 'period', label: 'Period', type: 'text', required: true },
      { key: 'budgeted_hours', label: 'Budgeted Hours', type: 'number', required: true },
      { key: 'actual_hours', label: 'Actual Hours', type: 'number', required: true },
      { key: 'budgeted_amount', label: 'Budgeted Amount (£)', type: 'number', required: true },
      { key: 'actual_amount', label: 'Actual Amount (£)', type: 'number', required: true },
      { key: 'cumulative_budget_consumed_pct', label: 'Budget Consumed %', type: 'number', required: true },
      { key: 'estimated_completion_pct', label: 'Est. Completion %', type: 'number' },
    ]
  },
  client_wallet_estimates: {
    label: 'Client Wallet Estimates', group: 'Market Intelligence',
    description: 'Estimated total legal spend per client with confidence levels.',
    fields: [
      { key: 'estimate_id', label: 'Estimate ID', type: 'text', required: true, auto: true },
      { key: 'client_id', label: 'Client', type: 'text', required: true, fk: { table: 'clients', idKey: 'client_id', labelKey: 'name' } },
      { key: 'period', label: 'Period', type: 'text', required: true },
      { key: 'estimated_total_legal_spend', label: 'Est. Total Spend (£)', type: 'number', required: true },
      { key: 'estimation_method', label: 'Method', type: 'select', required: true, options: ['Public Filing','Industry Benchmark','Direct Intelligence','Peer Comparison'] },
      { key: 'confidence', label: 'Confidence', type: 'select', required: true, options: ['High','Medium','Low'] },
      { key: 'our_revenue', label: 'Our Revenue (£)', type: 'number', required: true },
      { key: 'share_of_wallet_pct', label: 'Share of Wallet %', type: 'number' },
      { key: 'data_source_notes', label: 'Source Notes', type: 'text' },
    ]
  },
  practice_coverage: {
    label: 'Practice Coverage', group: 'Market Intelligence',
    description: 'Which practice areas the firm serves per client, and where gaps are.',
    fields: [
      { key: 'coverage_id', label: 'Coverage ID', type: 'text', required: true, auto: true },
      { key: 'client_id', label: 'Client', type: 'text', required: true, fk: { table: 'clients', idKey: 'client_id', labelKey: 'name' } },
      { key: 'practice_area', label: 'Practice Area', type: 'select', required: true, options: ['Corporate/M&A','Litigation & Disputes','Employment','Real Estate','Regulatory & Compliance'] },
      { key: 'served_by_us', label: 'Served By Us', type: 'select', required: true, options: ['1','0'] },
      { key: 'estimated_client_spend', label: 'Est. Client Spend (£)', type: 'number' },
      { key: 'known_competitor', label: 'Known Competitor', type: 'text' },
      { key: 'source', label: 'Source', type: 'text' },
    ]
  },
  market_signals: {
    label: 'Market Signals', group: 'Market Intelligence',
    description: 'Competitive intelligence: directory rankings, lateral hires, panel appointments.',
    fields: [
      { key: 'signal_id', label: 'Signal ID', type: 'text', required: true, auto: true },
      { key: 'client_id', label: 'Client', type: 'text', fk: { table: 'clients', idKey: 'client_id', labelKey: 'name' } },
      { key: 'signal_date', label: 'Date', type: 'date', required: true },
      { key: 'signal_type', label: 'Type', type: 'select', required: true, options: ['Directory Ranking','Panel Appointment','Lateral Hire','News Mention','Award','Client Announcement'] },
      { key: 'source', label: 'Source', type: 'text', required: true },
      { key: 'content', label: 'Content', type: 'text', required: true },
      { key: 'competitor', label: 'Competitor', type: 'text' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['High','Medium','Low'] },
    ]
  },
};

const GROUPS = ['Core Reference', 'Transactional', 'Market Intelligence'];

// ─── Add Row Modal ───
function AddRowModal({ table, fields, onSave, onClose }) {
  const [formData, setFormData] = useState(() => {
    const init = {};
    fields.forEach(f => { init[f.key] = ''; });
    return init;
  });
  const [errors, setErrors] = useState({});
  // For each FK field, load the list of available records so we can render a dropdown.
  // fkOptions[fieldKey] = [{ id, label }]
  const [fkOptions, setFkOptions] = useState({});

  useEffect(() => {
    const fkFields = fields.filter(f => f.fk);
    if (fkFields.length === 0) return;
    let cancelled = false;
    Promise.all(fkFields.map(f =>
      api.get(`/data/tables/${f.fk.table}?limit=500`)
        .then(r => ({ key: f.key, options: (r.data.rows || []).map(row => ({ id: row[f.fk.idKey], label: row[f.fk.labelKey] || row[f.fk.idKey] })) }))
        .catch(() => ({ key: f.key, options: [] }))
    )).then(results => {
      if (cancelled) return;
      const map = {};
      for (const r of results) map[r.key] = r.options;
      setFkOptions(map);
    });
    return () => { cancelled = true; };
  }, [fields]);

  function handleChange(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear any error on the field the user is editing
    setErrors(prev => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const errs = {};
    for (const f of fields) {
      const val = formData[f.key];
      // Required check — skip for auto-generated id fields (backend fills them).
      if (f.required && !f.auto && (val === '' || val === null || val === undefined)) {
        errs[f.key] = 'Required';
        continue;
      }
      // Number validation — must parse to a finite number if non-empty.
      if (f.type === 'number' && val !== '' && val !== null && val !== undefined) {
        const n = parseFloat(val);
        if (!Number.isFinite(n)) errs[f.key] = 'Must be a number';
      }
      // Date validation — ISO-ish YYYY-MM-DD.
      if (f.type === 'date' && val !== '' && val !== null && val !== undefined) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) errs[f.key] = 'Use YYYY-MM-DD';
      }
    }
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const data = { ...formData };
    // Remove auto-generated ID fields if empty — backend will generate
    fields.forEach(f => {
      if (f.auto && !data[f.key]) delete data[f.key];
      if (f.type === 'number' && data[f.key] !== '') data[f.key] = parseFloat(data[f.key]);
    });
    onSave(data);
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.6)',backdropFilter:'blur(4px)'}}>
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:28,width:'100%',maxWidth:560,maxHeight:'80vh',overflow:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <h3 style={{fontSize:'1.1rem',fontWeight:600}}>Add Row to {TABLE_META[table]?.label}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={20} /></button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{display:'block',fontSize:'0.78rem',fontWeight:550,color:'var(--text-secondary)',marginBottom:4}}>
                {f.label} {f.required && <span style={{color:'var(--accent-red)'}}>*</span>}
                {f.auto && <span style={{color:'var(--text-muted)',fontWeight:400}}> (auto-generated if empty)</span>}
                {errors[f.key] && <span style={{color:'var(--accent-red)',fontWeight:600,marginLeft:8}}>· {errors[f.key]}</span>}
              </label>
              {f.fk ? (
                <select
                  value={formData[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  style={{width:'100%',padding:'8px 12px',background:'var(--bg-secondary)',border:`1px solid ${errors[f.key] ? 'var(--accent-red)' : 'var(--border)'}`,borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'0.88rem'}}
                >
                  <option value="">— Select {f.label.toLowerCase()} —</option>
                  {(fkOptions[f.key] || []).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label} ({opt.id})</option>
                  ))}
                </select>
              ) : f.type === 'select' ? (
                <select
                  value={formData[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  style={{width:'100%',padding:'8px 12px',background:'var(--bg-secondary)',border:`1px solid ${errors[f.key] ? 'var(--accent-red)' : 'var(--border)'}`,borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'0.88rem'}}
                >
                  <option value="">— Select —</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                  value={formData[f.key]}
                  onChange={e => handleChange(f.key, e.target.value)}
                  placeholder={f.type === 'date' ? '2024-06-15' : f.type === 'number' ? '0' : `Enter ${f.label.toLowerCase()}`}
                  step={f.type === 'number' ? 'any' : undefined}
                  style={{width:'100%',padding:'8px 12px',background:'var(--bg-secondary)',border:`1px solid ${errors[f.key] ? 'var(--accent-red)' : 'var(--border)'}`,borderRadius:'var(--radius-sm)',color:'var(--text-primary)',fontSize:'0.88rem',boxSizing:'border-box'}}
                />
              )}
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:24}}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}><Plus size={14} /> Add Row</button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Edit Row ───
function EditableCell({ value, field, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(value ?? '');

  function commit() {
    setEditing(false);
    const finalVal = field.type === 'number' && editVal !== '' ? parseFloat(editVal) : editVal;
    if (finalVal !== value) onSave(finalVal);
  }

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        style={{cursor:'pointer',borderBottom:'1px dashed var(--border-light)',paddingBottom:1}}
        title="Click to edit"
      >
        {value !== null && value !== undefined ? String(value) : '—'}
      </span>
    );
  }

  if (field.type === 'select') {
    return (
      <select
        value={editVal}
        onChange={e => setEditVal(e.target.value)}
        onBlur={commit}
        autoFocus
        style={{padding:'2px 4px',background:'var(--bg-secondary)',border:'1px solid var(--accent-blue)',borderRadius:4,color:'var(--text-primary)',fontSize:'0.82rem',width:'100%'}}
      >
        <option value="">—</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
      value={editVal}
      onChange={e => setEditVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
      autoFocus
      step={field.type === 'number' ? 'any' : undefined}
      style={{padding:'2px 4px',background:'var(--bg-secondary)',border:'1px solid var(--accent-blue)',borderRadius:4,color:'var(--text-primary)',fontSize:'0.82rem',width:'100%',boxSizing:'border-box'}}
    />
  );
}

// ─── Main Component ───
export default function DataManagement() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('clients');
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    api.get('/data/tables').then(r => {
      setTables(r.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadTable();
  }, [selectedTable, page, filter]);

  function loadTable() {
    setTableLoading(true);
    api.get(`/data/tables/${selectedTable}?page=${page}&limit=50&filter=${filter}`).then(r => {
      setRows(r.data.rows || []);
      setTotalRows(r.data.total || 0);
      setTableLoading(false);
    }).catch(() => setTableLoading(false));
  }

  async function refreshTables() {
    const r = await api.get('/data/tables');
    setTables(r.data);
  }

  async function addRow(data) {
    try {
      await api.post(`/data/tables/${selectedTable}`, data);
      setShowAddModal(false);
      loadTable();
      refreshTables();
    } catch (e) {
      alert('Error adding row: ' + (e.response?.data?.error || e.message));
    }
  }

  async function updateCell(rowId, columnKey, newValue) {
    try {
      await api.put(`/data/tables/${selectedTable}/${rowId}`, { [columnKey]: newValue });
      loadTable();
    } catch (e) {
      alert('Error updating: ' + (e.response?.data?.error || e.message));
    }
  }

  async function deleteSampleData(table) {
    if (!confirm(`Delete all sample data from ${TABLE_META[table]?.label || table}? This cannot be undone.`)) return;
    await api.delete(`/data/sample-data/${table}`);
    refreshTables();
    loadTable();
  }

  async function deleteAllSampleData() {
    if (!confirm('Delete ALL sample data from ALL tables? This removes the entire Whitfield & Partners demo dataset and cannot be undone.')) return;
    await api.delete('/data/sample-data');
    refreshTables();
    loadTable();
  }

  async function deleteRow(id) {
    if (!confirm('Delete this row?')) return;
    await api.delete(`/data/tables/${selectedTable}/${id}`);
    loadTable();
    refreshTables();
  }

  if (loading) return <div className="empty-state"><div className="loading-spinner" style={{margin:'0 auto'}}></div></div>;

  const meta = TABLE_META[selectedTable];
  const tableInfo = tables.find(t => t.name === selectedTable);
  const fields = meta?.fields || [];
  const pkField = fields[0]?.key;
  const totalPages = Math.ceil(totalRows / 50);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Data Management</h2>
          <p style={{display:'flex',alignItems:'center',gap:8}}>
            Browse, edit, and manage all canonical tables. Click any cell to edit it inline.
            <InfoTooltip text="All three data entry modes (demo data, file upload, manual entry) write to identical table schemas. Rows tagged 'Sample' are demo data from Whitfield & Partners. Click any cell to edit. Use 'Add Row' to enter new data." />
          </p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={deleteAllSampleData}>
          <Trash2 size={14} /> Remove All Demo Data
        </button>
      </div>

      <div className="dm-layout">
        {/* Table List Sidebar */}
        <div className="dm-sidebar">
          <div className="card" style={{padding:12}}>
            {GROUPS.map(group => (
              <div key={group}>
                <div className="dm-group-label">{group}</div>
                <div className="dm-table-list">
                  {Object.entries(TABLE_META)
                    .filter(([_, m]) => m.group === group)
                    .map(([key, m]) => {
                      const info = tables.find(t => t.name === key);
                      return (
                        <div key={key}
                          className={`dm-table-item ${selectedTable === key ? 'active' : ''}`}
                          onClick={() => { setSelectedTable(key); setPage(1); }}
                        >
                          <div className="name">{m.label}</div>
                          <div className="meta">
                            {info?.total_rows || 0} rows
                            {info?.sample_rows > 0 && <span style={{color:'var(--accent-purple)'}}> · {info.sample_rows} sample</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="dm-content">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  {meta?.label}
                  <InfoTooltip text={meta?.description} />
                </div>
                <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:2}}>
                  {totalRows} rows total · {tableInfo?.sample_rows || 0} sample · {tableInfo?.user_rows || 0} user ·
                  <span style={{color:'var(--accent-blue)'}}> Click any cell to edit</span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="dm-toolbar">
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
                <Plus size={14} /> Add Row
              </button>
              <div style={{display:'flex',gap:4}}>
                <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter('all'); setPage(1); }}>All</button>
                <button className={`btn btn-sm ${filter === 'sample' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter('sample'); setPage(1); }}>
                  Sample
                </button>
                <button className={`btn btn-sm ${filter === 'user' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setFilter('user'); setPage(1); }}>Your Data</button>
              </div>
              <div style={{marginLeft:'auto'}}>
                <button className="btn btn-danger btn-sm" onClick={() => deleteSampleData(selectedTable)}>
                  <Trash2 size={12} /> Delete Sample
                </button>
              </div>
            </div>

            {/* Data Table */}
            {tableLoading ? (
              <div style={{padding:40,textAlign:'center'}}><div className="loading-spinner" style={{margin:'0 auto'}}></div></div>
            ) : rows.length === 0 ? (
              <div className="empty-state">
                <Database size={40} />
                <h3>No data found</h3>
                <p>Click "Add Row" to start entering data, or upload a file.</p>
              </div>
            ) : (
              <>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {fields.map(f => (
                          <th key={f.key}>
                            {f.label}
                            {f.required && <span style={{color:'var(--accent-red)',marginLeft:2}}>*</span>}
                          </th>
                        ))}
                        <th style={{width:40}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => {
                        const rowId = row[pkField];
                        return (
                          <tr key={i}>
                            {fields.map((f, fi) => (
                              <td key={f.key} className={f.type === 'number' ? 'num' : ''}>
                                {fi === 0 ? (
                                  // Primary key — show with sample badge, not editable
                                  <span style={{display:'flex',alignItems:'center',gap:6}}>
                                    {String(row[f.key] ?? '')}
                                    {row.is_sample_data ? <span className="sample-badge">Sample</span> : null}
                                  </span>
                                ) : (
                                  <EditableCell
                                    value={row[f.key]}
                                    field={f}
                                    onSave={(newVal) => updateCell(rowId, f.key, newVal)}
                                  />
                                )}
                              </td>
                            ))}
                            <td>
                              <button className="btn btn-danger btn-sm" style={{padding:'2px 6px'}}
                                onClick={() => deleteRow(rowId)}>
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16,alignItems:'center'}}>
                    <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Page {page} of {totalPages}</span>
                    <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Row Modal */}
      {showAddModal && (
        <AddRowModal
          table={selectedTable}
          fields={fields}
          onSave={addRow}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
