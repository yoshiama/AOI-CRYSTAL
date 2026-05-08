import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'aoi.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      failed_attempts INTEGER DEFAULT 0,
      locked_until INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      expires_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      photos TEXT DEFAULT '[]',
      colors TEXT DEFAULT '[]',
      finishes TEXT DEFAULT '[]',
      custom_text TEXT,
      visible INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      customer_address TEXT,
      customer_postal TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL DEFAULT 0,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pendiente',
      bizum_screenshot TEXT,
      internal_notes TEXT,
      material_cost REAL DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      read INTEGER DEFAULT 0,
      order_id INTEGER,
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (strftime('%s','now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT DEFAULT 'material',
      expense_date INTEGER DEFAULT (strftime('%s','now')),
      created_at INTEGER DEFAULT (strftime('%s','now'))
    );
  `);

  // Seed default settings if not exists
  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number }).c;
  if (settingsCount === 0) {
    const ins = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    ins.run('bizum_number', '600000000');
    ins.run('sobre_nosotras_intro', 'En AOI Crystal somos dos personas con mucho cariño y ganas de crear algo bonito juntas. Lo que empezó como una forma de generar un poco más cada mes se fue convirtiendo en algo mucho más especial: un pequeño rincón donde cada pieza se hace a mano, con tiempo, con detalle y con mucho amor por la resina.');
    ins.run('sobre_nosotras_cta', 'Pero lo que más nos gusta es que cada accesorio puede ser completamente tuyo. Dinos cómo lo imaginas, qué colores te enamoran, si es para ti o para regalar, y nosotras haremos todo lo posible para crear algo único que no exista en ningún otro lugar.');
    ins.run('contact_email', 'aoicrystalor@gmail.com');
    ins.run('contact_instagram', 'aoicrystal');
    ins.run('shop_name', 'AOI Crystal');
    ins.run('shipping_peninsular', '4.50');
    ins.run('shipping_baleares', '7.00');
    ins.run('shipping_canarias', '9.00');
    ins.run('free_shipping_threshold', '30');
    ins.run('logo_url', '');
    ins.run('split_employees', '70');
    ins.run('split_company', '30');
  }

  // Seed admin user if not exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('aoi');
  if (!existing) {
    const hashed = bcrypt.hashSync('aoi2024', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('aoi', hashed);
  }

  // Seed real products from briefing if none
  const productCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() as { c: number }).c;
  if (productCount === 0) {
    const ins = db.prepare(`INSERT INTO products (name, category, description, price, photos, colors, finishes, custom_text, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    ins.run('Llavero de la fortuna (Pack 2)', 'llavero', 'Pack de 2 llaveros de resina artesanos. Elige tus dos colores favoritos.', 5, '[]', '["rosa","morado","azul","verde","amarillo"]', '[]', 'Indica los 2 colores que quieres en el campo de notas', 1);
    ins.run('Letra del nombre', 'letra', 'Letra decorativa de resina personalizada con tu inicial o la inicial de quien quieras. Perfecta para regalar.', 7, '[]', '["rosa","morado","blanco","negro","azul"]', '["purpurina","flor","piedras"]', 'Indica qué letra quieres', 1);
    ins.run('Letra paraguas', 'paraguas', 'Letra de resina con acabado paraguas, perfecta como accesorio original.', 8, '[]', '["rosa","morado","azul","verde","blanco"]', '["purpurina","flor","piedras"]', 'Indica qué letra quieres', 1);
    ins.run('Letra llavero', 'llavero', 'Llavero con la letra que tú elijas, en resina artesana con distintos acabados.', 7, '[]', '["rosa","morado","azul","verde","blanco"]', '["purpurina","flor","piedras"]', 'Indica qué letra quieres', 1);
    ins.run('Pendiente figura', 'pendiente', 'Pendientes de resina con distintas figuras. Elige el modelo que más te guste en la galería de Instagram.', 4, '[]', '["rosa","morado","azul","blanco","negro"]', '["brillo","mate"]', 'Indica el modelo que quieres (puedes ver la galería en @aoicrystal)', 1);
    ins.run('Pendiente grande', 'pendiente', 'Pendientes grandes de resina artesana, llamativos y únicos.', 8, '[]', '["rosa","morado","azul","dorado","plateado"]', '["brillo","mate","purpurina"]', 'Indica el modelo o colores preferidos', 1);
    ins.run('Pendiente mediano', 'pendiente', 'Pendientes medianos de resina, perfectos para el día a día.', 8, '[]', '["rosa","morado","azul","dorado","plateado"]', '["brillo","mate","purpurina"]', 'Indica el modelo o colores preferidos', 1);
    ins.run('Llavero portafoto', 'llavero', 'Llavero con portafoto personalizado. Envíanos la foto que quieras incluir y nosotras lo hacemos.', 12, '[]', '["transparente","rosa","morado"]', '["brillo","mate"]', 'Envíanos tu foto a aoicrystalor@gmail.com indicando el número de pedido', 1);
  }
}

export function logActivity(action: string, entity?: string, entityId?: number, details?: string) {
  const db = getDb();
  db.prepare('INSERT INTO activity_log (action, entity, entity_id, details) VALUES (?, ?, ?, ?)').run(action, entity || null, entityId || null, details || null);
}
