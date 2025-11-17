import { registerWorkerEmail, shutdownWorkerEmail } from './email/tasker';
import { connection } from '../lib/queue';

const registerFns = [
  registerWorkerEmail,
];

const shutdownFns = [
  shutdownWorkerEmail,
];

export const registerAllWorkers = async () => {
  await Promise.all(registerFns.map((fn) => fn()));
};

export const shutdownAllWorkers = async () => {
  for (const shutdownFn of shutdownFns) {
    try {
      await shutdownFn();
    } catch (error) {
      console.error('[worker] Failed to shutdown worker:', error);
    }
  }
  await connection.quit();
};

