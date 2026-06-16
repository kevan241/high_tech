/*
  Warnings:

  - You are about to drop the column `role` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
