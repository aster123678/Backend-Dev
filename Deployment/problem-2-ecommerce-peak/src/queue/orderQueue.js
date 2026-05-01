const { Queue } = require('bullmq');

const connection = {
  connection: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  }
};

const orderQueue = new Queue('orders', {
  ...connection,
  defaultJobOptions: {
    attempts: 10,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 10000,
    removeOnFail: false
  }
});

async function enqueueOrder(order) {
  return orderQueue.add('process-order', order, {
    jobId: order.id,
    priority: order.priority || 5
  });
}

module.exports = { orderQueue, enqueueOrder };

