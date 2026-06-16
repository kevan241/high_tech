-- CreateTable
CREATE TABLE "HeroBlock" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "buttonText" TEXT NOT NULL DEFAULT '',
    "buttonLink" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "HeroBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeroBlock_slot_key" ON "HeroBlock"("slot");
