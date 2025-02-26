-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderStatus" TEXT NOT NULL DEFAULT 'yet to start',
ALTER COLUMN "amountCharged" DROP NOT NULL,
ALTER COLUMN "amountPaid" DROP NOT NULL;
