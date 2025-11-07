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
    const { 
      title, 
      quantity, 
      unit_price, 
      payer_name, 
      payer_email, 
      payer_phone,
      metadata 
    } = req.body;

    // Validar campos requeridos
    if (!title || !unit_price || !payer_email) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: title, unit_price, payer_email' 
      });
    }

    // Crear preferencia con el formato correcto que Mercado Pago espera
    const preferenceData = {
      items: [
        {
          title: title,
          quantity: quantity || 1,
          unit_price: parseFloat(unit_price),
          currency_id: 'MXN'
        }
      ],
      payer: {
        name: payer_name || 'Cliente',
        email: payer_email,
        phone: {
          number: payer_phone || ''
        }
      },
      payment_methods: {
        excluded_payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'prepaid_card' }
        ],
        installments: 1
      },
      back_urls: {
        success: 'https://tootaltickets.com/pago-exitoso',
        failure: 'https://tootaltickets.com/pago-fallido',
        pending: 'https://tootaltickets.com/pago-pendiente'
      },
      auto_return: 'approved',
      external_reference: metadata?.order_id || `ORDER-${Date.now()}`,
      notification_url: `https://ventastotaltickets-gif-tootal-tickets.onrender.com/api/mercadopago-webhook`,
      metadata: metadata || {}
    };

    console.log('📦 Creando preferencia con datos:', JSON.stringify(preferenceData, null, 2));

    const preference = await mercadopago.preferences.create(preferenceData);
    
    console.log('✅ Preferencia creada exitosamente:', preference.body.id);

    res.status(200).json({
      init_point: preference.body.init_point,
      id: preference.body.id
    });
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error);
    res.status(500).json({ 
      error: 'Error al crear preferencia',
      message: error.message,
      details: error.cause
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
