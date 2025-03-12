/*
  Warnings:

  - Added the required column `firmId` to the `FirmVisibilitySetting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserVisibilitySetting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FirmVisibilitySetting" ADD COLUMN     "firmId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserVisibilitySetting" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserVisibilitySetting" ADD CONSTRAINT "UserVisibilitySetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmVisibilitySetting" ADD CONSTRAINT "FirmVisibilitySetting_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
