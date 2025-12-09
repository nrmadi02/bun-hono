-- CreateTable
CREATE TABLE "casbin_rule" (
    "id" SERIAL NOT NULL,
    "ptype" TEXT NOT NULL,
    "v0" TEXT,
    "v1" TEXT,
    "v2" TEXT,
    "v3" TEXT,
    "v4" TEXT,
    "v5" TEXT,

    CONSTRAINT "casbin_rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "casbin_rule_ptype_idx" ON "casbin_rule"("ptype");

-- CreateIndex
CREATE INDEX "casbin_rule_v0_idx" ON "casbin_rule"("v0");

-- CreateIndex
CREATE INDEX "casbin_rule_v1_idx" ON "casbin_rule"("v1");
