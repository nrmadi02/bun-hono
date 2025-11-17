import { emailQueue } from '../../../lib/queue';
import { EMAIL_TASK } from '../processor';

export const sendVerificationEmailAsync = async (emails: string[]) => {
  const job = await emailQueue.add(EMAIL_TASK.SendVerificationEmail, { emails });
  console.info(`Job ${job.id} added to queue. Task scheduled for ${EMAIL_TASK.SendVerificationEmail}, emails: ${emails}`);
};