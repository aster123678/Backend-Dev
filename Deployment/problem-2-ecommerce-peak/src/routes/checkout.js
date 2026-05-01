const express = require('express');
const CircuitBreaker = require('../resilience/circuitBreaker');
const { enqueueOrder } = require('../queue/orderQueue');
const metrics = require('../monitoring/metrics');

const router = express.Router();

async function chargePayment(order) {
  const response = await fetch(`${process.env.PAYMENT_GATEWAY_URL}/charge`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(order)
  });
  if (!response.ok) throw new Error(`Payment failed with ${response.status}`);
  return response.json();
}

const paymentBreaker = new CircuitBreaker(chargePayment, {
  failureThreshold: 5,
  resetTimeoutMs: 30000
});

router.post('/checkout', async (req, res, next) => {
  const order = {
    id: req.body.id || `order-${Date.now()}`,
    items: req.body.items || [],
    amount: req.body.amount,
    customerId: req.body.customerId
  };

  try {
    const payment = await paymentBreaker.fire(order);
    await enqueueOrder({ ...order, paymentStatus: 'paid', payment });
    metrics.recordQueuedOrder();
    res.status(202).json({ accepted: true, orderId: order.id, paymentStatus: 'paid' });
  } catch (error) {
    await enqueueOrder({ ...order, paymentStatus: 'pending', reason: error.message, priority: 1 });
    metrics.recordQueuedOrder();
    res.status(202).json({ accepted: true, orderId: order.id, paymentStatus: 'queued' });
  }
});

module.exports = router;

