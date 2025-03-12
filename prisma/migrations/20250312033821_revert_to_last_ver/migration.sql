/*
  Warnings:

  - You are about to drop the column `firmId` on the `FirmVisibilitySetting` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `UserVisibilitySetting` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FirmVisibilitySetting" DROP CONSTRAINT "FirmVisibilitySetting_firmId_fkey";

-- DropForeignKey
ALTER TABLE "UserVisibilitySetting" DROP CONSTRAINT "UserVisibilitySetting_userId_fkey";

-- DropIndex
DROP INDEX "UserVisibilitySetting_userId_fieldName_key";

-- AlterTable
ALTER TABLE "FirmVisibilitySetting" DROP COLUMN "firmId";

-- AlterTable
ALTER TABLE "UserVisibilitySetting" DROP COLUMN "userId";
