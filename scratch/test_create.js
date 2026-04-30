const axios = require('axios');

async function testCreate() {
  try {
    const res = await axios.post('http://localhost:3001/api/serenatas', {
      nombre_cliente: 'Test User',
      telefono: '56911112222',
      nombre_festejada: 'Test Festejada',
      motivo: 'Test Motivo',
      fecha: '2026-05-01',
      hora: '20:00',
      direccion: 'Test Address',
      comuna: 'Santiago',
      tipo: 'express',
      precio_total: 25000,
      canciones: ['El Rey'],
      estado: 'confirmada'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testCreate();
