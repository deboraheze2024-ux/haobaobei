CREATE TABLE "app_settings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"active_child_id" varchar(36),
	"knowledge_base" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"references" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_in_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"date" varchar(20) NOT NULL,
	"period" varchar(20) NOT NULL,
	"tasks" jsonb NOT NULL,
	"completed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "child_profiles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"birth_date" varchar(20),
	"gender" varchar(20),
	"avatar" text,
	"nickname" varchar(100),
	"personality" text,
	"strengths" jsonb,
	"challenges" jsonb,
	"interests" jsonb,
	"current_stage" varchar(50),
	"key_behaviors" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emotion_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"child_id" varchar(36) NOT NULL,
	"date" varchar(20) NOT NULL,
	"time" varchar(10),
	"emotion" varchar(20) NOT NULL,
	"intensity" integer,
	"trigger" text,
	"behavior" text,
	"parent_response" text,
	"result" varchar(20),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_meetings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"date" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"attendees" jsonb,
	"agenda" jsonb,
	"gratitude_list" jsonb,
	"brainstorms" jsonb,
	"decisions" jsonb,
	"fun_plan" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "growth_goals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"child_id" varchar(36) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(50),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"priority" varchar(20),
	"progress" integer DEFAULT 0 NOT NULL,
	"nodes" jsonb,
	"start_date" varchar(20),
	"target_end_date" varchar(20),
	"actual_end_date" varchar(20),
	"total_duration" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "important_experiences" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"child_id" varchar(36),
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(20) NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"highlight" text,
	"related_notes" jsonb,
	"related_reflections" jsonb,
	"images" jsonb,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"child_id" varchar(36),
	"title" varchar(200) NOT NULL,
	"source" varchar(20) NOT NULL,
	"source_name" varchar(200),
	"date" varchar(20) NOT NULL,
	"summary" text NOT NULL,
	"insights" text NOT NULL,
	"application" text NOT NULL,
	"action_plan" text NOT NULL,
	"images" jsonb,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parenting_notes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"child_id" varchar(36),
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"tags" jsonb,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phrase_cards" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"category" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"situation" text,
	"source_chapter" varchar(100),
	"is_favorite" boolean DEFAULT false NOT NULL,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reflection_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"child_id" varchar(36),
	"title" varchar(200) NOT NULL,
	"date" varchar(20) NOT NULL,
	"situation" text NOT NULL,
	"thoughts" text NOT NULL,
	"feelings" text NOT NULL,
	"actions" text NOT NULL,
	"result" text NOT NULL,
	"analysis" text NOT NULL,
	"learnings" text NOT NULL,
	"images" jsonb,
	"tags" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_templates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"period" varchar(20) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "emotion_records" ADD CONSTRAINT "emotion_records_child_id_child_profiles_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "growth_goals" ADD CONSTRAINT "growth_goals_child_id_child_profiles_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "important_experiences" ADD CONSTRAINT "important_experiences_child_id_child_profiles_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_records" ADD CONSTRAINT "learning_records_child_id_child_profiles_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parenting_notes" ADD CONSTRAINT "parenting_notes_child_id_child_profiles_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reflection_records" ADD CONSTRAINT "reflection_records_child_id_child_profiles_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_settings_active_child_id_idx" ON "app_settings" USING btree ("active_child_id");--> statement-breakpoint
CREATE INDEX "chat_messages_role_idx" ON "chat_messages" USING btree ("role");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "check_in_records_date_idx" ON "check_in_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "check_in_records_period_idx" ON "check_in_records" USING btree ("period");--> statement-breakpoint
CREATE INDEX "child_profiles_name_idx" ON "child_profiles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "child_profiles_current_stage_idx" ON "child_profiles" USING btree ("current_stage");--> statement-breakpoint
CREATE INDEX "emotion_records_child_id_idx" ON "emotion_records" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "emotion_records_date_idx" ON "emotion_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "emotion_records_emotion_idx" ON "emotion_records" USING btree ("emotion");--> statement-breakpoint
CREATE INDEX "family_meetings_date_idx" ON "family_meetings" USING btree ("date");--> statement-breakpoint
CREATE INDEX "family_meetings_status_idx" ON "family_meetings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "growth_goals_child_id_idx" ON "growth_goals" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "growth_goals_status_idx" ON "growth_goals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "growth_goals_category_idx" ON "growth_goals" USING btree ("category");--> statement-breakpoint
CREATE INDEX "important_experiences_child_id_idx" ON "important_experiences" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "important_experiences_category_idx" ON "important_experiences" USING btree ("category");--> statement-breakpoint
CREATE INDEX "important_experiences_is_starred_idx" ON "important_experiences" USING btree ("is_starred");--> statement-breakpoint
CREATE INDEX "learning_records_child_id_idx" ON "learning_records" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "learning_records_source_idx" ON "learning_records" USING btree ("source");--> statement-breakpoint
CREATE INDEX "learning_records_date_idx" ON "learning_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "parenting_notes_child_id_idx" ON "parenting_notes" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "parenting_notes_is_pinned_idx" ON "parenting_notes" USING btree ("is_pinned");--> statement-breakpoint
CREATE INDEX "parenting_notes_created_at_idx" ON "parenting_notes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "phrase_cards_category_idx" ON "phrase_cards" USING btree ("category");--> statement-breakpoint
CREATE INDEX "phrase_cards_is_favorite_idx" ON "phrase_cards" USING btree ("is_favorite");--> statement-breakpoint
CREATE INDEX "reflection_records_child_id_idx" ON "reflection_records" USING btree ("child_id");--> statement-breakpoint
CREATE INDEX "reflection_records_date_idx" ON "reflection_records" USING btree ("date");--> statement-breakpoint
CREATE INDEX "reflection_records_created_at_idx" ON "reflection_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_templates_period_idx" ON "task_templates" USING btree ("period");