-- CreateEnum
CREATE TYPE "CompensationType" AS ENUM ('monthly', 'hourly');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "basic_salary" DECIMAL(14,2),
ADD COLUMN     "compensation_type" "CompensationType" NOT NULL DEFAULT 'hourly';

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "default_compensation_type" "CompensationType" NOT NULL DEFAULT 'hourly';

-- CreateTable
CREATE TABLE "payslips" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "year" SMALLINT NOT NULL,
    "month" SMALLINT NOT NULL,
    "compensation_type" "CompensationType" NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "gross_amount" DECIMAL(14,2) NOT NULL,
    "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(14,2) NOT NULL,
    "working_days" SMALLINT NOT NULL,
    "paid_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "unpaid_leave_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "breakdown" JSONB NOT NULL DEFAULT '{}',
    "finalized_by_user" UUID,
    "finalized_by_name" VARCHAR(150),
    "finalized_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payslips_organization_id_year_month_idx" ON "payslips"("organization_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_employee_id_year_month_key" ON "payslips"("employee_id", "year", "month");

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
