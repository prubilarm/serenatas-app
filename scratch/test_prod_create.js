const axios = require('axios');

async function testProdCreate() {
  try {
    const res = await axios.post('https://api-alpha-five-25.vercel.app/api/serenatas', {
      nombre_cliente: 'Prod Test User',
      telefono: '56900000000',
      nombre_festejada: 'Prod Test Festejada',
      motivo: 'Prod Test Motivo',
      fecha: '2026-05-01',
      hora: '21:00',
      direccion: 'Prod Test Address',
      comuna: 'Santiago',
      tipo: 'express',
      precio_total: 25000,
      canciones: ['El Rey'],
      estado: 'confirmada'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error Status:', err.response ? err.response.status : 'No response');
    console.error('Error Data:', err.response ? err.response.data : err.message);
  }
}

testProdCreate();
