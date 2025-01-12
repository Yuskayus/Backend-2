const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');


// Endpoint untuk mendapatkan data nasabah berdasarkan ClientID
router.get('/:clientId', async (req, res) => {
  const { clientId } = req.params;

  const query = `
    SELECT 
      c.ClientID,
      c.ClientName, 
      c.CreatedDate AS TanggalPembuatan, 
      c.ActiveDate AS TanggalAktivasi,
      c.LastUpdate AS UpdateDataNasabah, 
      ct.LastTrxDate AS TransaksiTerakhirNasabah, 
      CASE 
          WHEN c.ClientStatus = 1 THEN 'active' 
          WHEN c.ClientStatus = 2 THEN 'suspended' 
          WHEN c.ClientStatus = 3 THEN 'closed'
          ELSE 'open' 
      END AS StatusNasabah,
      DATEDIFF(DAY, c.ActiveDate, GETDATE()) AS LamaMenjadiNasabahDalamHari,
      DATEDIFF(YEAR, c.ActiveDate, GETDATE()) AS LamaMenjadiNasabahDalamTahun
    FROM 
      Client c
    LEFT JOIN 
      ClientTrxLastTrxDateView ct ON ct.ClientNID = c.ClientNID
    WHERE 
      c.ClientID = @clientId;`;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('clientId', sql.VarChar, clientId).query(query);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('SQL Error', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
