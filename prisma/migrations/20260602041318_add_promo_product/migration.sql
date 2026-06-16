-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "pricePromo" DOUBLE PRECISION,
ADD COLUMN     "promoActive" BOOLEAN NOT NULL DEFAULT false;
