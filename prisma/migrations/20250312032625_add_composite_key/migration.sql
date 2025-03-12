/*
  Warnings:

  - A unique constraint covering the columns `[userId,fieldName]` on the table `UserVisibilitySetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserVisibilitySetting_userId_fieldName_key" ON "UserVisibilitySetting"("userId", "fieldName");
