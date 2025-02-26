/*
  Warnings:

  - Added the required column `amountCharged` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountPaid` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountCharged" INTEGER NOT NULL,
ADD COLUMN     "amountPaid" INTEGER NOT NULL,
ADD COLUMN     "dateOfOrder" TEXT,
ADD COLUMN     "payementExpected" TEXT,
ADD COLUMN     "typeOfOrder" TEXT;
