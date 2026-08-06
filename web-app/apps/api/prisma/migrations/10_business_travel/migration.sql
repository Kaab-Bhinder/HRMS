-- CreateEnum
CREATE TYPE "TravelStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'advance_paid', 'realization_submitted', 'verified', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('flight', 'train', 'car', 'bus', 'other');

-- CreateEnum
CREATE TYPE "TravelVerification" AS ENUM ('approved', 'partially_approved', 'rejected');

-- CreateEnum
CREATE TYPE "TravelApprover" AS ENUM ('supervisor', 'department_head', 'finance');

-- CreateTable
CREATE TABLE "travel_requests" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "reference" VARCHAR(40) NOT NULL,
    "destination_city" VARCHAR(160) NOT NULL,
    "client_id" UUID,
    "client_name" VARCHAR(200),
    "purpose" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "transportation" "TransportMode" NOT NULL,
    "hotel_needed" BOOLEAN NOT NULL DEFAULT false,
    "estimated_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "TravelStatus" NOT NULL DEFAULT 'draft',
    "requested_transport" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "requested_hotel" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "requested_allowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "approved_transport" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "approved_hotel" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "approved_allowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "advance_note" TEXT,
    "advance_paid_at" TIMESTAMP(3),
    "advance_payment_ref" VARCHAR(120),
    "actual_departure_date" DATE,
    "actual_return_date" DATE,
    "transport_used" VARCHAR(200),
    "hotel_used" VARCHAR(200),
    "actual_transport" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "actual_hotel" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "actual_allowance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "realization_note" TEXT,
    "realization_submitted_at" TIMESTAMP(3),
    "verification" "TravelVerification",
    "verified_amount" DECIMAL(14,2),
    "verification_note" TEXT,
    "verified_by_user_id" UUID,
    "verified_at" TIMESTAMP(3),
    "settlement_amount" DECIMAL(14,2),
    "settlement_paid_at" TIMESTAMP(3),
    "settlement_payment_ref" VARCHAR(120),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "travel_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_activities" (
    "id" UUID NOT NULL,
    "travel_request_id" UUID NOT NULL,
    "activity_date" DATE NOT NULL,
    "time_label" VARCHAR(20) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_evidence" (
    "id" UUID NOT NULL,
    "travel_request_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "caption" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_approval_rules" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "min_level" INTEGER NOT NULL DEFAULT 0,
    "max_level" INTEGER NOT NULL DEFAULT 999,
    "steps" "TravelApprover"[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travel_approval_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "travel_requests_organization_id_status_idx" ON "travel_requests"("organization_id", "status");

-- CreateIndex
CREATE INDEX "travel_requests_employee_id_start_date_idx" ON "travel_requests"("employee_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "travel_requests_organization_id_reference_key" ON "travel_requests"("organization_id", "reference");

-- CreateIndex
CREATE INDEX "travel_activities_travel_request_id_activity_date_idx" ON "travel_activities"("travel_request_id", "activity_date");

-- CreateIndex
CREATE INDEX "travel_evidence_travel_request_id_idx" ON "travel_evidence"("travel_request_id");

-- CreateIndex
CREATE INDEX "travel_approval_rules_organization_id_is_active_idx" ON "travel_approval_rules"("organization_id", "is_active");

-- AddForeignKey
ALTER TABLE "travel_requests" ADD CONSTRAINT "travel_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_requests" ADD CONSTRAINT "travel_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_activities" ADD CONSTRAINT "travel_activities_travel_request_id_fkey" FOREIGN KEY ("travel_request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_evidence" ADD CONSTRAINT "travel_evidence_travel_request_id_fkey" FOREIGN KEY ("travel_request_id") REFERENCES "travel_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

