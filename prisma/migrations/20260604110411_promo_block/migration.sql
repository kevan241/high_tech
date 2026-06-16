-- CreateTable
CREATE TABLE "PubBlock" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "linkUrl" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "PubBlock_pkey" PRIMARY KEY ("id")
);
