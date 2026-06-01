import request from 'supertest';
import express from 'express';

// For this sample test, we will create a simple express app 
// or import your existing express app instance.
// If your server/index.js exports the app, you can import it here.
// For demonstration, we'll test a basic ping route that you might have.

const app = express();
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

describe('Health Check API', () => {
  it('should return 200 OK for /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
