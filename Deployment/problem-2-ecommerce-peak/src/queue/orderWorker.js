const { Worker } = require('bullmq');

const worker = new Worker(
  'orders',
  async (job) => {
    console.log(JSON.stringify({ event: 'processing_order', orderId: job.data.id }));
    return { processed: true };
  },
  {
    connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
    concurrency: Number(process.env.ORDER_WORKER_CONCURRENCY || 50)
  }
);

worker.on('failed', (job, error) => {
  console.error(JSON.stringify({ event: 'order_failed', orderId: job && job.data.id, error: error.message }));
});

