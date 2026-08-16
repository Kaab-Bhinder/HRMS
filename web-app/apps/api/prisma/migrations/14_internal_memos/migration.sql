-- CreateEnum
CREATE TYPE "MemoRecipientKind" AS ENUM ('to', 'oversight');

-- CreateTable
CREATE TABLE "memos" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "sender_user" UUID NOT NULL,
    "sender_emp" UUID,
    "sender_name" VARCHAR(150) NOT NULL,
    "sender_dept" UUID,
    "sender_dept_name" VARCHAR(150),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "memos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memo_recipients" (
    "id" UUID NOT NULL,
    "memo_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "department_name" VARCHAR(150),
    "kind" "MemoRecipientKind" NOT NULL DEFAULT 'to',
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memo_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memos_organization_id_created_at_idx" ON "memos"("organization_id", "created_at");
CREATE INDEX "memos_organization_id_sender_user_idx" ON "memos"("organization_id", "sender_user");
CREATE INDEX "memo_recipients_organization_id_user_id_read_at_idx" ON "memo_recipients"("organization_id", "user_id", "read_at");
CREATE UNIQUE INDEX "memo_recipients_memo_id_user_id_key" ON "memo_recipients"("memo_id", "user_id");

-- AddForeignKey
ALTER TABLE "memo_recipients" ADD CONSTRAINT "memo_recipients_memo_id_fkey"
  FOREIGN KEY ("memo_id") REFERENCES "memos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
