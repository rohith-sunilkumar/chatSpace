const axios = require('axios');

async function test() {
  try {
    console.log('1. Registering...');
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User ' + Date.now(),
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    });
    const token = registerRes.data.token;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('2. Creating workspace...');
    const wsRes = await axios.post('http://localhost:5000/api/workspaces', { name: 'My Test WS' });
    const ws = wsRes.data;
    console.log('Workspace formed:', ws.name, 'ID:', ws._id, 'Invite:', ws.inviteCode);

    console.log('3. Getting workspaces...');
    const myWsRes = await axios.get('http://localhost:5000/api/workspaces');
    console.log('Workspaces count:', myWsRes.data.length);

    console.log('4. Creating channel...');
    const chRes = await axios.post('http://localhost:5000/api/channels', { workspaceId: ws._id, name: 'development' });
    console.log('Channel created:', chRes.data.name);

    console.log('5. Getting channels...');
    const chsRes = await axios.get(`http://localhost:5000/api/channels/${ws._id}`);
    console.log('Channels count:', chsRes.data.length);

    console.log('✅ ALL API TESTS PASSED');
  } catch (err) {
    console.error('❌ ERROR:', err.response ? err.response.data : err.message);
  }
}
test();
