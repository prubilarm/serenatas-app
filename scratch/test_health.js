const axios = require('axios');

async function testHealth() {
  try {
    const res = await axios.get('http://localhost:3001/api/health');
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testHealth();
