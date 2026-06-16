-- CreateEnum
CREATE TYPE "CategorieType" AS ENUM ('CATEGORIE', 'MARQUE');

-- DropIndex
DROP INDEX "Categorie_name_key";

-- AlterTable
ALTER TABLE "Categorie" ADD COLUMN     "type" "CategorieType" NOT NULL DEFAULT 'CATEGORIE';
