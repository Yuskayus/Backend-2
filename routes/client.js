const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');
const sql = require('mssql');




// Endpoint untuk mengambil data client
router.get('/basics/:clientId', async (req, res) => {
  const { clientId } = req.params;

  // Query untuk mengambil data client berdasarkan clientId
  const query = `
    SELECT 
      C.ClientNID, 
      C.ClientID, 
      C.ClientName, 
      C.Email,
      C.CreatedDate 
    FROM 
      Client C
    WHERE 
      C.ClientID = @clientId;
  `;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('clientId', sql.VarChar, clientId).query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint untuk mengambil semua client
router.get('/clients', async (req, res) => {
  const query = `
    SELECT 
      C.ClientID, 
      C.ClientName,
      C.Email 
    FROM 
      Client C
  `;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No clients found' });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





// Data client sebagai contoh
const clients = {
  'BD00001': { id: 'BD00001', name: 'Client BD00001' },
  'BD00002': { id: 'BD00002', name: 'Client BD00002' },
  // Tambahkan data lainnya sesuai kebutuhan
};

// Menangani permintaan GET untuk /api/clients/:clientId
router.get('/api/clients/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  // Mencari data client berdasarkan clientId
  const client = clients[clientId];
  
  if (client) {
    res.json(client); // Mengembalikan data client dalam format JSON
  } else {
    res.status(404).json({ message: 'Client not found' }); // Menangani jika client tidak ditemukan
  }
});



router.get('/profit-loss/:clientId', async (req, res) => {
  const { clientId } = req.params;
  console.log(`Request received for profit-loss with clientId: ${clientId}`);

  const query = `
    SELECT 
        t.ClientNID, 
        t.StockNID, 
        SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume) AS pl, 
        SUM(ISNULL(cs.avgprice, 0) * t.TradeVolume) AS modal,
        -- Kolom untung
        CASE 
            WHEN SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume) > 0 
            THEN SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume)
            ELSE 0 
        END AS profit,
        -- Kolom rugi
        CASE 
            WHEN SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume) < 0 
            THEN SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume)
            ELSE 0 
        END AS loss
    FROM S21Plus_PS.dbo.Trade t
    OUTER APPLY (
        SELECT TOP 1 cs.avgprice
        FROM S21Plus_PS.dbo.ClientStock cs
        WHERE cs.ClientNID = t.ClientNID 
          AND cs.StockNID = t.StockNID
          AND cs.avgprice IS NOT NULL
          AND cs.Date <= t.TradeDate
          AND cs.avgprice > 0
        ORDER BY cs.Date DESC
    ) cs
    WHERE t.TradeDate >= '2024-01-01' 
      AND cs.avgprice > 0
      AND t.ClientNID = @clientId -- Filter untuk client tertentu
    GROUP BY t.ClientNID, t.StockNID
    HAVING SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume) > 0 -- Memilih hanya yang menghasilkan profit
    ORDER BY profit DESC;`;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('clientId', sql.VarChar, clientId).query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No profit-loss data found for this client.' });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/saham-profit-loss-with-avg/:clientId', async (req, res) => {
  const query = `
    SELECT TOP 1  
        t.ClientNID, 
        t.StockNID, 
        (SUM((t.TradePrice - ISNULL(cs.avgprice, 0)) * t.TradeVolume) / SUM(ISNULL(cs.avgprice, 0) * t.TradeVolume)) * 100 AS pl_percentage
    FROM  
        S21Plus_PS.dbo.Trade t
    OUTER APPLY (
        SELECT TOP 1 cs.avgprice
        FROM S21Plus_PS.dbo.ClientStock cs
        WHERE cs.clientnid = t.clientnid 
          AND cs.stocknid = t.stocknid
          AND cs.Date <= t.TradeDate
          AND cs.avgprice > 0
        ORDER BY cs.date DESC
    ) cs
    WHERE 
        t.TradeDate >= '2024-01-01' 
        AND t.TradeDate <= '2024-12-31' 
        AND cs.avgprice > 0 
        AND t.ClientNID = 913
    GROUP BY 
        t.clientnid, 
        t.stocknid
    ORDER BY 
        t.clientnid, 
        pl_percentage DESC;

  `;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('clientId', sql.VarChar, clientId).query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No profit-loss data found for this client.' });
    }

    res.json(result.recordset);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Endpoint untuk mengambil data client berdasarkan clientId
router.get('basics/:clientId', async (req, res) => {
  const { clientId } = req.params;

  // Query untuk mengambil data client berdasarkan clientId
  const query = `
    SELECT 
      C.ClientNID, 
      C.ClientID, 
      C.ClientName, 
      C.Email 
    FROM 
      Client C
    WHERE 
      C.ClientID = @clientId;
  `;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('clientId', sql.VarChar, clientId).query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




// Endpoint untuk mendapatkan data nasabah berdasarkan ClientID
router.get('/details/:clientId', async (req, res) => {
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
