import { emailQueue } from '../../../lib/queue';
import { EMAIL_TASK } from '../processor';

export const sendVerificationEmailAsync = async (emails: string[], token: string) => {
  const job = await emailQueue.add(EMAIL_TASK.SendVerificationEmail, { emails, token });
  console.info(`Job ${job.id} added to queue. Task scheduled for ${EMAIL_TASK.SendVerificationEmail}, emails: ${emails}`);
};

export const sendResetPasswordEmailAsync = async (emails: string[], token: string) => {
  const job = await emailQueue.add(EMAIL_TASK.SendResetPasswordEmail, { emails, token });
  console.info(`Job ${job.id} added to queue. Task scheduled for ${EMAIL_TASK.SendResetPasswordEmail}, emails: ${emails}`);
};