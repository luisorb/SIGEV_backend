-- CreateTable
CREATE TABLE "event_catalogs" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdById" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_catalogs_name_key" ON "event_catalogs"("name");

-- CreateIndex
CREATE INDEX "event_catalogs_createdById_idx" ON "event_catalogs"("createdById");

-- AddForeignKey
ALTER TABLE "event_catalogs" ADD CONSTRAINT "event_catalogs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;