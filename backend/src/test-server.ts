// Simple test server to verify Railway deployment
const http = require('http');

const port = process.env.PORT || 8080;

console.log('=== SIMPLE TEST SERVER STARTING ===');
console.log('PORT from env:', process.env.PORT);
console.log('Using port:', port);

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      port: port,
      timestamp: new Date().toISOString() 
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server is running on port ' + port);
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Test server is running on http://0.0.0.0:${port}`);
});