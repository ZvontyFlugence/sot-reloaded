/*
  Warnings:

  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workerId` to the `JobOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `JobOffer` ADD COLUMN `workerId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Employee`;

-- CreateTable
CREATE TABLE `JobRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(30) NOT NULL,
    `wage` DECIMAL(65, 30) NOT NULL DEFAULT 1.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
