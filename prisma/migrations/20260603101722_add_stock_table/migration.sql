-- CreateTable
CREATE TABLE "StockAlertConfig" (
    "id" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 5,
    "email" TEXT NOT NULL,

    CONSTRAINT "StockAlertConfig_pkey" PRIMARY KEY ("id")
);
