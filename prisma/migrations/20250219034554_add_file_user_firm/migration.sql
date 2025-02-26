-- AlterTable
ALTER TABLE "Firm" ADD COLUMN     "agreementFile" TEXT,
ADD COLUMN     "ndaFile" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agreementFile" TEXT,
ADD COLUMN     "dpiitFile" TEXT,
ADD COLUMN     "gstFile" TEXT,
ADD COLUMN     "ndaFile" TEXT,
ADD COLUMN     "qunatifoFile" TEXT,
ADD COLUMN     "udhyanFile" TEXT;
