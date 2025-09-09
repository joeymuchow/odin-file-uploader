/*
  Warnings:

  - You are about to drop the column `title` on the `File` table. All the data in the column will be lost.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "title",
ADD COLUMN     "name" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Folder" ADD COLUMN     "name" TEXT NOT NULL;
