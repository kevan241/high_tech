-- CreateTable
CREATE TABLE "BonPlanBlock" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "title" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonPlanBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BonPlanBlock_slot_key" ON "BonPlanBlock"("slot");
