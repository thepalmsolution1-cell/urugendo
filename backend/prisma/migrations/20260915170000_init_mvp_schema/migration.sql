-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PROVIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PreferredLanguage" AS ENUM ('EN', 'RW');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ProviderCategory" AS ENUM ('RESTAURANT', 'CAFE', 'ACTIVITY', 'ATTRACTION', 'HOTEL', 'TRANSPORT', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'SAVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('REQUESTED', 'PROCESSING', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RESERVATION_UPDATE', 'PLAN_UPDATE', 'PROVIDER_RESPONSE', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "contactPhone" TEXT,
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "preferredLanguage" "PreferredLanguage" NOT NULL DEFAULT 'EN',
    "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experiencePreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRw" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRw" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameRw" TEXT,
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProviderCategory" NOT NULL,
    "description" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "priceRangeMin" INTEGER,
    "priceRangeMax" INTEGER,
    "rating" DOUBLE PRECISION,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dataUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProviderCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "priceRwf" INTEGER NOT NULL,
    "durationMinutes" INTEGER,
    "capacity" INTEGER,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'UNKNOWN',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "providerId" TEXT,
    "categoryId" TEXT,
    "embedding" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceTag" (
    "experienceId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ExperienceTag_pkey" PRIMARY KEY ("experienceId","tagId")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceRwf" INTEGER NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "rawText" TEXT NOT NULL,
    "extractedIntent" JSONB,
    "clarification" JSONB,
    "location" TEXT,
    "people" INTEGER,
    "budgetRwf" INTEGER,
    "occasion" TEXT,
    "preferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "needsTransport" BOOLEAN,
    "needsAccommodation" BOOLEAN,
    "requestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperiencePlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT,
    "title" TEXT NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "location" TEXT,
    "startsAt" TIMESTAMP(3),
    "people" INTEGER NOT NULL DEFAULT 1,
    "budgetRwf" INTEGER,
    "estimatedTotalRwf" INTEGER NOT NULL DEFAULT 0,
    "remainingRwf" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperiencePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanComponent" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "componentType" "ProviderCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "priceRwf" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "experienceId" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT,
    "experienceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "planId" TEXT,
    "planComponentId" TEXT,
    "experienceId" TEXT,
    "reservedDate" TIMESTAMP(3) NOT NULL,
    "reservedTime" TEXT,
    "people" INTEGER NOT NULL DEFAULT 1,
    "specialRequest" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'REQUESTED',
    "providerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_contactPhone_key" ON "User"("contactPhone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Provider_category_idx" ON "Provider"("category");

-- CreateIndex
CREATE INDEX "Provider_location_idx" ON "Provider"("location");

-- CreateIndex
CREATE INDEX "Provider_verificationStatus_idx" ON "Provider"("verificationStatus");

-- CreateIndex
CREATE INDEX "Provider_userId_idx" ON "Provider"("userId");

-- CreateIndex
CREATE INDEX "Experience_category_idx" ON "Experience"("category");

-- CreateIndex
CREATE INDEX "Experience_location_idx" ON "Experience"("location");

-- CreateIndex
CREATE INDEX "Experience_priceRwf_idx" ON "Experience"("priceRwf");

-- CreateIndex
CREATE INDEX "Experience_availabilityStatus_idx" ON "Experience"("availabilityStatus");

-- CreateIndex
CREATE INDEX "Experience_verificationStatus_idx" ON "Experience"("verificationStatus");

-- CreateIndex
CREATE INDEX "Experience_providerId_idx" ON "Experience"("providerId");

-- CreateIndex
CREATE INDEX "MenuItem_providerId_idx" ON "MenuItem"("providerId");

-- CreateIndex
CREATE INDEX "ExperienceRequest_userId_idx" ON "ExperienceRequest"("userId");

-- CreateIndex
CREATE INDEX "ExperiencePlan_userId_idx" ON "ExperiencePlan"("userId");

-- CreateIndex
CREATE INDEX "ExperiencePlan_status_idx" ON "ExperiencePlan"("status");

-- CreateIndex
CREATE INDEX "ExperiencePlan_requestId_idx" ON "ExperiencePlan"("requestId");

-- CreateIndex
CREATE INDEX "PlanComponent_planId_idx" ON "PlanComponent"("planId");

-- CreateIndex
CREATE INDEX "PlanComponent_experienceId_idx" ON "PlanComponent"("experienceId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_providerId_idx" ON "Favorite"("providerId");

-- CreateIndex
CREATE INDEX "Favorite_experienceId_idx" ON "Favorite"("experienceId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_providerId_key" ON "Favorite"("userId", "providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_experienceId_key" ON "Favorite"("userId", "experienceId");

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_providerId_idx" ON "Reservation"("providerId");

-- CreateIndex
CREATE INDEX "Reservation_planId_idx" ON "Reservation"("planId");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceTag" ADD CONSTRAINT "ExperienceTag_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceTag" ADD CONSTRAINT "ExperienceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceRequest" ADD CONSTRAINT "ExperienceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperiencePlan" ADD CONSTRAINT "ExperiencePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperiencePlan" ADD CONSTRAINT "ExperiencePlan_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ExperienceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanComponent" ADD CONSTRAINT "PlanComponent_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ExperiencePlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanComponent" ADD CONSTRAINT "PlanComponent_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ExperiencePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_planComponentId_fkey" FOREIGN KEY ("planComponentId") REFERENCES "PlanComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
