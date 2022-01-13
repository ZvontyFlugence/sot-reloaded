/*
  Warnings:

  - You are about to drop the column `read` on the `MsgThread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MsgThread` DROP COLUMN `read`;

-- CreateTable
CREATE TABLE `Mail` (
    `threadId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`threadId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
