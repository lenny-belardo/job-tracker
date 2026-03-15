/*
  Warnings:

  - You are about to drop the column `applicationData` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "applicationData",
ADD COLUMN     "applicationDate" TIMESTAMP(3);
