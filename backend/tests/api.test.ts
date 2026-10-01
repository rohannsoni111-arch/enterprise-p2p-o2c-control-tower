import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Enterprise P2P & O2C API Integration Tests', () => {
  let procurementToken = '';
  let financeToken = '';

  beforeAll(async () => {
    // Authenticate Procurement User
    const procRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'procurement', password: 'Password123!' });

    expect(procRes.status).toBe(200);
    expect(procRes.body.success).toBe(true);
    procurementToken = procRes.body.data.token;

    // Authenticate Finance User
    const finRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'finance', password: 'Password123!' });

    expect(finRes.status).toBe(200);
    financeToken = finRes.body.data.token;
  });

  it('GET /api/health - should report ONLINE status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
  });

  it('GET /api/auth/personas - should return seeded demo users', async () => {
    const res = await request(app).get('/api/auth/personas');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(6);
  });

  it('GET /api/materials - should list materials with calculated stock status', async () => {
    const res = await request(app).get('/api/materials?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0]).toHaveProperty('stockStatus');
  });

  it('GET /api/purchase-orders - should list POs with vendor relations', async () => {
    const res = await request(app).get('/api/purchase-orders?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.data[0]).toHaveProperty('poNumber');
  });

  it('POST /api/purchase-requisitions - should create a new PR with procurement token', async () => {
    // Get first material and plant
    const matRes = await request(app).get('/api/materials?limit=1');
    const mat = matRes.body.data[0];

    const prPayload = {
      notes: 'Automated test requisition',
      items: [
        {
          materialId: mat.id,
          plantId: mat.plantId,
          quantity: 25,
          estimatedPrice: mat.standardCost,
        },
      ],
    };

    const res = await request(app)
      .post('/api/purchase-requisitions')
      .set('Authorization', `Bearer ${procurementToken}`)
      .send(prPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.prNumber).toContain('PR-');
  });

  it('POST /api/purchase-requisitions - should reject unauthenticated request', async () => {
    const res = await request(app)
      .post('/api/purchase-requisitions')
      .send({ notes: 'Invalid request', items: [] });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboard/executive - should return consolidated enterprise health metrics', async () => {
    const res = await request(app).get('/api/dashboard/executive');
    expect(res.status).toBe(200);
    expect(res.body.data.kpiCards).toHaveProperty('p2pHealthScore');
    expect(res.body.data.kpiCards).toHaveProperty('o2cHealthScore');
  });

  it('GET /api/dashboard/p2p - should return P2P cycle times and spend trend', async () => {
    const res = await request(app).get('/api/dashboard/p2p');
    expect(res.status).toBe(200);
    expect(res.body.data.metrics).toHaveProperty('averageP2PCycleTimeDays');
    expect(res.body.data).toHaveProperty('poStatusDistribution');
  });

  it('GET /api/dashboard/o2c - should return O2C OTIF and regional sales', async () => {
    const res = await request(app).get('/api/dashboard/o2c');
    expect(res.status).toBe(200);
    expect(res.body.data.metrics).toHaveProperty('otifRatePct');
  });

  it('GET /api/trace - should trace P2P lifecycle for PO-10001', async () => {
    const res = await request(app).get('/api/trace?docType=PO&docNumber=PO-10001');
    expect(res.status).toBe(200);
    expect(res.body.data.process).toBe('P2P');
    expect(res.body.data.nodes.length).toBeGreaterThanOrEqual(3);
  });
});
