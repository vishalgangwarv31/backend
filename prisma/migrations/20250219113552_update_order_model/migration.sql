-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "commentStatusCycle" TEXT[],
ADD COLUMN     "dateOdExpectation" TEXT,
ADD COLUMN     "dateOfFilling" TEXT,
ADD COLUMN     "documentProvided" TEXT[],
ADD COLUMN     "fileUploaded" TEXT[],
ADD COLUMN     "govtAppNumber" INTEGER,
ADD COLUMN     "inmNumber" TEXT,
ADD COLUMN     "invoiceUploaded" TEXT[],
ADD COLUMN     "lawyerRefrenceNumber" INTEGER,
ADD COLUMN     "nextActionClient" TEXT,
ADD COLUMN     "nextActionLawyer" TEXT,
ADD COLUMN     "orderCompleteDate" TEXT;
