import { connection, emailQueue } from '../../lib/queue';
import { createWorkerManager } from '../worker-factory';
import { emailWorkerProcessor } from './processor';

const { register, shutdown } = createWorkerManager({
  queueName: emailQueue.name,
  processor: emailWorkerProcessor,
  connection,
  label: 'email',
});

export const registerWorkerEmail = register;
export const shutdownWorkerEmail = shutdown;