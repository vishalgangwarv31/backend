/*
  Warnings:

  - The `tdsFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `panCard` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `agreementFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dpiitFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gstFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ndaFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `qunatifoFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `udhyanFile` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otherFile" TEXT[],
DROP COLUMN "tdsFile",
ADD COLUMN     "tdsFile" TEXT[],
DROP COLUMN "panCard",
ADD COLUMN     "panCard" TEXT[],
DROP COLUMN "agreementFile",
ADD COLUMN     "agreementFile" TEXT[],
DROP COLUMN "dpiitFile",
ADD COLUMN     "dpiitFile" TEXT[],
DROP COLUMN "gstFile",
ADD COLUMN     "gstFile" TEXT[],
DROP COLUMN "ndaFile",
ADD COLUMN     "ndaFile" TEXT[],
DROP COLUMN "qunatifoFile",
ADD COLUMN     "qunatifoFile" TEXT[],
DROP COLUMN "udhyanFile",
ADD COLUMN     "udhyanFile" TEXT[];
