-- AlterTable
ALTER TABLE "EmailVerification" ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "EmailVerification_token_idx" ON "EmailVerification"("token");
