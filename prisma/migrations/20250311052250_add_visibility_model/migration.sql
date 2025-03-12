-- CreateTable
CREATE TABLE "UserVisibilitySetting" (
    "id" SERIAL NOT NULL,
    "fieldName" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserVisibilitySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmVisibilitySetting" (
    "id" SERIAL NOT NULL,
    "fieldName" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FirmVisibilitySetting_pkey" PRIMARY KEY ("id")
);
