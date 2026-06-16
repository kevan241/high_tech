-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "marqueId" TEXT;

-- CreateTable
CREATE TABLE "Marque" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Marque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Marque_name_key" ON "Marque"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("id") ON DELETE SET NULL ON UPDATE CASCADE;
