const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS
app.use(cors());
app.use(express.json());

// Configurar Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// Endpoint para crear preferencia de pago
app.post('/api/create-mercadopago-preference', async (req, res) => {
  try {
    const preference = await mercadopago.preferences.create(req.body);
    
    res.status(200).json({
      init_point: preference.body.init_point,
      id: preference.body.id
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al crear preferencia',
      message: error.message 
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend de Tootal Tickets funcionando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
