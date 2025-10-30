-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN_GB', 'PT_BR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN_GB',
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postcode" TEXT;
