-- CreateTable
CREATE TABLE "BannerBlock" (
    "id" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "buttonText" TEXT NOT NULL DEFAULT '',
    "buttonLink" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "BannerBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BannerBlock_slot_key" ON "BannerBlock"("slot");
