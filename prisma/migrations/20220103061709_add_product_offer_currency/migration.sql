/*
  Warnings:

  - A unique constraint covering the columns `[currencyCode]` on the table `ProductOffer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currencyCode` to the `ProductOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProductOffer` ADD COLUMN `currencyCode` VARCHAR(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ProductOffer_currencyCode_key` ON `ProductOffer`(`currencyCode`);
