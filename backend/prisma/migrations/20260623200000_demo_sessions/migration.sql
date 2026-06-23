-- CreateTable
CREATE TABLE "demo_sessions" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_sessions_pkey" PRIMARY KEY ("id")
);

-- Remove dados globais legados (agora os dados são isolados por sessão demo)
DELETE FROM "tasks";
DELETE FROM "projects";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "demoSessionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "demoSessionId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "demo_sessions_expiresAt_idx" ON "demo_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "projects_demoSessionId_idx" ON "projects"("demoSessionId");

-- CreateIndex
CREATE INDEX "tasks_demoSessionId_idx" ON "tasks"("demoSessionId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_demoSessionId_fkey" FOREIGN KEY ("demoSessionId") REFERENCES "demo_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_demoSessionId_fkey" FOREIGN KEY ("demoSessionId") REFERENCES "demo_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
