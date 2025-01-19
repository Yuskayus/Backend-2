const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const clientRoutes = require('./routes/client');
const profitLossRouter = require('./routes/client');
const profitLossRouterAvg = require('./routes/client');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
// app.use(cors());

app.use(cors({
  origin: '*', // Ganti dengan 'http://localhost:3000' jika ingin lebih spesifik
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'], // Izinkan header Authorization
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use(bodyParser.json());

// app.get('/api/clientCash', async (req, res) => {
//     const { code } = req.query;
  
//     try {
//       const response = await axios.get(`https://tradeapi.alphainvestasi.id/WebConsole/api/clientCash?code=${code}`, {
//         headers: {
//           Authorization: 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJjaGFubmVsIjoiQU5EUk9JRCIsImVtYWlsIjoicy5iYWdvZXNAZ21haWwuY29tIiwiZXhwIjoxNzM1OTI0NzM1LCJpYXQiOjE3MzU4MzgzMzUsImlzcyI6ImF1dGgwIiwibG9naW5UaW1lIjoxNzM1ODM4MzM1LCJzdWIiOjEsInVzZXJJRCI6IlMwMDAzUCJ9.SKXI0MXmS1sqjRIvTGZp1XbsLifUXJq6g4X5HgHPz7Qew9_U9YrsSbIhix9KJCvsEjvU2B7OKA93ZwpAcKef3A',
//           'Content-Type': 'application/json',
//         },
//       });
//       res.json(response.data);
//     } catch (err) {
//       res.status(err.response?.status || 500).json({ error: err.message });
//     }
//   });

// Routes
app.use('/api/client', clientRoutes);
// app.use('/api/saham-profit-loss');
app.use('/api/client', profitLossRouter);
app.use('/api/client', profitLossRouterAvg);

// Data client yang di-mapping berdasarkan clientId
const clientDataMap = {
  'sooj': 300,
  '3eed': 500,
  'abc': 100,
  'xyz': 200,
};

// Endpoint untuk mengambil data berdasarkan clientId
app.get('/client', (req, res) => {
  const { id } = req.query; // Ambil parameter 'id' dari query string

  // Ambil data berdasarkan clientId
  const clientData = clientDataMap[id] || 'Data tidak ditemukan';

  // Kirim response ke frontend
  res.json({ clientId: id, clientData });
});


// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
