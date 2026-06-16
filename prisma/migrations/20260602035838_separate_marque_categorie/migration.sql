/*
  Warnings:

  - You are about to drop the column `type` on the `Categorie` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Categorie` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Categorie" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CategorieType";

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_name_key" ON "Categorie"("name");
