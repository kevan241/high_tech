-- CreateTable
CREATE TABLE "CategorySection2" (
    "id" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "CategorySection2_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategorySection2" ADD CONSTRAINT "CategorySection2_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
