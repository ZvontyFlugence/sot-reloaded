/*
  Warnings:

  - You are about to drop the column `authorId` on the `Newspaper` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[newsId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Newspaper_authorId_key` ON `Newspaper`;

-- AlterTable
ALTER TABLE `Newspaper` DROP COLUMN `authorId`;

-- CreateIndex
CREATE UNIQUE INDEX `User_newsId_key` ON `User`(`newsId`);
