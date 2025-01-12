const sql = require('mssql');

const dbConfig = {
  user: 's21+',
  password: 'diehards21plus',
  server: '192.168.3.25',
  database: 'S21Plus_PS',
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('Database Connection Failed! ', err);
    process.exit(1);
  });

module.exports = {
  sql,
  poolPromise,
};
