/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `image` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `name`,
    ADD COLUMN `username` VARCHAR(45) NOT NULL,
    MODIFY `image` VARCHAR(191) NOT NULL DEFAULT 'default-user.jpg',
    MODIFY `jobId` INTEGER NOT NULL DEFAULT -1,
    MODIFY `partyId` INTEGER NOT NULL DEFAULT -1,
    MODIFY `unitId` INTEGER NOT NULL DEFAULT -1,
    MODIFY `newsId` INTEGER NOT NULL DEFAULT -1;
