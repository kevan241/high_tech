-- CreateTable
CREATE TABLE "CategorySection" (
    "id" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 4,

    CONSTRAINT "CategorySection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategorySection" ADD CONSTRAINT "CategorySection_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
