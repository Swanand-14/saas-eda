/*
  Warnings:

  - You are about to drop the column `isSubcribed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "isSubcribed",
ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false;
