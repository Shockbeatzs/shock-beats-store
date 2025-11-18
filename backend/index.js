const express = require('express');
const cors = require('cors');
const app = express();

// Configurações
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas de teste
app.get('/', (req, res) => {
  res.send('Backend do Shock Beatzs rodando!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`JWT_SECRET: ${JWT_SECRET ? 'set' : 'not set'}`);
});
