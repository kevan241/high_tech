-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categorieId" TEXT;

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_name_key" ON "Categorie"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
