const sqlite = require('better-sqlite3').verbose();

const db = new sqlite.Database('test.db', (err) => {
  if (err) {
    console.error('打开数据库失败:', err.message);
    process.exit(1);
  }
  console.log('成功连接到 SQLite 数据库。');
  db.close();
});