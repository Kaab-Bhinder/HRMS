-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('draft', 'sent', 'partially_signed', 'completed', 'declined', 'cancelled');
CREATE TYPE "SignerStatus" AS ENUM ('pending', 'viewed', 'signed', 'declined');

-- CreateTable
CREATE TABLE "agreement_templates" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agreement_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreements" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "template_id" UUID,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'draft',
    "body_hash" VARCHAR(64) NOT NULL,
    "created_by_user" UUID NOT NULL,
    "created_by_name" VARCHAR(150) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agreement_signers" (
    "id" UUID NOT NULL,
    "agreement_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "employee_id" UUID,
    "order_index" SMALLINT NOT NULL DEFAULT 0,
    "status" "SignerStatus" NOT NULL DEFAULT 'pending',
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "viewed_at" TIMESTAMP(3),
    "signed_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "decline_reason" TEXT,
    "signature_png" BYTEA,
    "signed_ip" VARCHAR(60),
    "signed_user_agent" VARCHAR(300),
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agreement_signers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agreement_templates_organization_id_is_active_idx" ON "agreement_templates"("organization_id", "is_active");
CREATE INDEX "agreements_organization_id_status_idx" ON "agreements"("organization_id", "status");
CREATE UNIQUE INDEX "agreement_signers_token_hash_key" ON "agreement_signers"("token_hash");
CREATE INDEX "agreement_signers_agreement_id_order_index_idx" ON "agreement_signers"("agreement_id", "order_index");
CREATE INDEX "agreement_signers_organization_id_status_idx" ON "agreement_signers"("organization_id", "status");

-- AddForeignKey
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "agreement_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agreement_signers" ADD CONSTRAINT "agreement_signers_agreement_id_fkey"
  FOREIGN KEY ("agreement_id") REFERENCES "agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
