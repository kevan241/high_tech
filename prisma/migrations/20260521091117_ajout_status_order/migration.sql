-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'En préparation';
