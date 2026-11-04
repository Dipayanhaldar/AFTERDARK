import fs from 'node:fs';
import path from 'node:path';
import { ObjectId } from 'mongodb';

export { ObjectId };

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'afterdark-db.json');

function serializeValue(val) {
  if (val instanceof ObjectId) return { __type: 'ObjectId', value: val.toString() };
  if (val instanceof Date) return { __type: 'Date', value: val.toISOString() };
  if (Array.isArray(val)) return val.map(serializeValue);
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = serializeValue(v);
    return out;
  }
  return val;
}

function deserializeValue(val) {
  if (Array.isArray(val)) return val.map(deserializeValue);
  if (val && typeof val === 'object') {
    if (val.__type === 'ObjectId' && typeof val.value === 'string' && /^[a-fA-F0-9]{24}$/.test(val.value)) {
      return new ObjectId(val.value);
    }
    if (val.__type === 'Date' && val.value) {
      return new Date(val.value);
    }
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = deserializeValue(v);
    return out;
  }
  return val;
}

function cloneDoc(doc) {
  return deserializeValue(serializeValue(doc));
}

function valuesEqual(a, b) {
  if (a === b) return true;
  if (a instanceof ObjectId && b instanceof ObjectId) return a.equals(b);
  if (a instanceof ObjectId && typeof b === 'string') return a.toString() === b;
  if (typeof a === 'string' && b instanceof ObjectId) return a === b.toString();
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return false;
}

function matchesCondition(fieldVal, cond) {
  if (cond && typeof cond === 'object' && !(cond instanceof ObjectId) && !(cond instanceof Date) && !Array.isArray(cond)) {
    for (const [op, target] of Object.entries(cond)) {
      if (op === '$gt') {
        const left = fieldVal instanceof Date ? fieldVal.getTime() : fieldVal;
        const right = target instanceof Date ? target.getTime() : target;
        if (!(left > right)) return false;
      } else if (op === '$lt') {
        const left = fieldVal instanceof Date ? fieldVal.getTime() : fieldVal;
        const right = target instanceof Date ? target.getTime() : target;
        if (!(left < right)) return false;
      } else if (op === '$in') {
        if (!Array.isArray(target)) return false;
        if (Array.isArray(fieldVal)) {
          if (!fieldVal.some(fv => target.some(t => valuesEqual(fv, t)))) return false;
        } else {
          if (!target.some(t => valuesEqual(fieldVal, t))) return false;
        }
      } else if (op === '$exists') {
        const exists = fieldVal !== undefined;
        if (Boolean(target) !== exists) return false;
      } else if (op === '$ne') {
        if (valuesEqual(fieldVal, target)) return false;
      }
    }
    return true;
  }
  if (Array.isArray(fieldVal) && !Array.isArray(cond)) {
    return fieldVal.some(item => valuesEqual(item, cond));
  }
  return valuesEqual(fieldVal, cond);
}

function matchesQuery(doc, query = {}) {
  if (!query || Object.keys(query).length === 0) return true;
  for (const [key, cond] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(cond)) {
      if (!cond.some(sub => matchesQuery(doc, sub))) return false;
      continue;
    }
    const fieldVal = doc[key];
    if (!matchesCondition(fieldVal, cond)) return false;
  }
  return true;
}

function applyProjection(doc, projection) {
  if (!projection || typeof projection !== 'object') return cloneDoc(doc);
  const keys = Object.keys(projection).filter(k => projection[k]);
  if (keys.length === 0) return cloneDoc(doc);
  const out = { _id: doc._id };
  for (const k of keys) {
    if (doc[k] !== undefined) out[k] = doc[k];
  }
  return cloneDoc(out);
}

function applyUpdate(doc, update, isInsert = false) {
  if (!update || typeof update !== 'object') return;
  if (update.$set) {
    for (const [k, v] of Object.entries(update.$set)) {
      doc[k] = cloneDoc(v);
    }
  }
  if (isInsert && update.$setOnInsert) {
    for (const [k, v] of Object.entries(update.$setOnInsert)) {
      if (doc[k] === undefined) doc[k] = cloneDoc(v);
    }
  }
  if (update.$unset) {
    for (const k of Object.keys(update.$unset)) {
      delete doc[k];
    }
  }
  if (update.$inc) {
    for (const [k, v] of Object.entries(update.$inc)) {
      doc[k] = (typeof doc[k] === 'number' ? doc[k] : 0) + Number(v);
    }
  }
  if (update.$addToSet) {
    for (const [k, v] of Object.entries(update.$addToSet)) {
      if (!Array.isArray(doc[k])) doc[k] = [];
      if (!doc[k].some(item => valuesEqual(item, v))) {
        doc[k].push(cloneDoc(v));
      }
    }
  }
}

class LocalCollection {
  constructor(name, dbInstance) {
    this.name = name;
    this.dbInstance = dbInstance;
  }

  get rows() {
    if (!this.dbInstance.collections[this.name]) {
      this.dbInstance.collections[this.name] = [];
    }
    return this.dbInstance.collections[this.name];
  }

  set rows(val) {
    this.dbInstance.collections[this.name] = val;
  }

  listIndexes() {
    return {
      toArray: async () => []
    };
  }

  async dropIndex() {
    return { ok: 1 };
  }

  async createIndex() {
    return 'ok_index';
  }

  async findOne(query = {}, options = {}) {
    let candidates = this.rows.filter(doc => matchesQuery(doc, query));
    if (options?.sort) {
      const sortEntries = Object.entries(options.sort);
      candidates.sort((a, b) => {
        for (const [field, dir] of sortEntries) {
          const av = a[field] instanceof Date ? a[field].getTime() : a[field];
          const bv = b[field] instanceof Date ? b[field].getTime() : b[field];
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
        }
        return 0;
      });
    }
    const found = candidates[0] || null;
    if (!found) return null;
    return applyProjection(found, options?.projection);
  }

  find(query = {}, options = {}) {
    let results = this.rows.filter(doc => matchesQuery(doc, query)).map(d => applyProjection(d, options?.projection));
    const cursor = {
      sort: (sortSpec = {}) => {
        const entries = Object.entries(sortSpec);
        results.sort((a, b) => {
          for (const [field, dir] of entries) {
            const av = a[field] instanceof Date ? a[field].getTime() : a[field];
            const bv = b[field] instanceof Date ? b[field].getTime() : b[field];
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
          }
          return 0;
        });
        return cursor;
      },
      limit: (n) => {
        results = results.slice(0, n);
        return cursor;
      },
      toArray: async () => results
    };
    return cursor;
  }

  async insertOne(doc) {
    if (this.name === 'users' && doc.email) {
      const duplicate = this.rows.find(r => r.email && r.email === doc.email);
      if (duplicate) {
        const err = new Error('Duplicate email');
        err.code = 11000;
        throw err;
      }
    }
    const insertedId = doc._id !== undefined ? doc._id : new ObjectId();
    const record = cloneDoc({ ...doc, _id: insertedId });
    this.rows.push(record);
    this.dbInstance.save();
    return { acknowledged: true, insertedId };
  }

  async updateOne(query = {}, update = {}, options = {}) {
    const idx = this.rows.findIndex(doc => matchesQuery(doc, query));
    if (idx !== -1) {
      applyUpdate(this.rows[idx], update, false);
      this.dbInstance.save();
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    }
    if (options?.upsert) {
      const base = {};
      for (const [k, v] of Object.entries(query)) {
        if (!k.startsWith('$') && (typeof v !== 'object' || v instanceof ObjectId || v instanceof Date)) {
          base[k] = cloneDoc(v);
        }
      }
      if (base._id === undefined) base._id = new ObjectId();
      applyUpdate(base, update, true);
      this.rows.push(base);
      this.dbInstance.save();
      return { acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedId: base._id };
    }
    return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
  }

  async updateMany(query = {}, update = {}) {
    let modifiedCount = 0;
    for (const doc of this.rows) {
      if (matchesQuery(doc, query)) {
        applyUpdate(doc, update, false);
        modifiedCount++;
      }
    }
    if (modifiedCount > 0) this.dbInstance.save();
    return { acknowledged: true, matchedCount: modifiedCount, modifiedCount };
  }

  async findOneAndUpdate(query = {}, update = {}, options = {}) {
    let doc = this.rows.find(d => matchesQuery(d, query));
    if (doc) {
      applyUpdate(doc, update, false);
      this.dbInstance.save();
      return cloneDoc(doc);
    }
    if (options?.upsert) {
      const base = {};
      for (const [k, v] of Object.entries(query)) {
        if (!k.startsWith('$') && (typeof v !== 'object' || v instanceof ObjectId || v instanceof Date)) {
          base[k] = cloneDoc(v);
        }
      }
      if (base._id === undefined) base._id = new ObjectId();
      applyUpdate(base, update, true);
      this.rows.push(base);
      this.dbInstance.save();
      return cloneDoc(base);
    }
    return null;
  }

  async deleteOne(query = {}) {
    const idx = this.rows.findIndex(doc => matchesQuery(doc, query));
    if (idx !== -1) {
      this.rows.splice(idx, 1);
      this.dbInstance.save();
      return { acknowledged: true, deletedCount: 1 };
    }
    return { acknowledged: true, deletedCount: 0 };
  }

  async deleteMany(query = {}) {
    const before = this.rows.length;
    this.rows = this.rows.filter(doc => !matchesQuery(doc, query));
    const deletedCount = before - this.rows.length;
    if (deletedCount > 0) this.dbInstance.save();
    return { acknowledged: true, deletedCount };
  }
}

class LocalDatabase {
  constructor() {
    this.collections = {};
    this.lastMtimeMs = 0;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const stat = fs.statSync(DB_FILE);
        if (stat.mtimeMs !== this.lastMtimeMs || Object.keys(this.collections).length === 0) {
          const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
          this.collections = deserializeValue(raw) || {};
          this.lastMtimeMs = stat.mtimeMs;
        }
      }
    } catch (err) {
      console.warn('Could not load local DB file, starting fresh:', err?.message);
      if (!this.collections) this.collections = {};
    }
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(serializeValue(this.collections), null, 2), 'utf8');
      if (fs.existsSync(DB_FILE)) {
        this.lastMtimeMs = fs.statSync(DB_FILE).mtimeMs;
      }
    } catch (err) {
      console.warn('Could not persist local DB file:', err?.message);
    }
  }

  collection(name) {
    this.load();
    return new LocalCollection(name, this);
  }

  async command() {
    return { ok: 1 };
  }
}

let singletonDb = null;
export function getLocalDatabase() {
  if (!singletonDb) singletonDb = new LocalDatabase();
  singletonDb.load();
  return singletonDb;
}
