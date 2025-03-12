/*
  Warnings:

  - A unique constraint covering the columns `[fieldName]` on the table `FirmVisibilitySetting` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fieldName]` on the table `UserVisibilitySetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FirmVisibilitySetting_fieldName_key" ON "FirmVisibilitySetting"("fieldName");

-- CreateIndex
CREATE UNIQUE INDEX "UserVisibilitySetting_fieldName_key" ON "UserVisibilitySetting"("fieldName");
