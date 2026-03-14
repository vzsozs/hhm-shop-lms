import { db } from "@/db";
import { trainings } from "@/db/schema/lms";
import { eq, desc } from "drizzle-orm";
import { OktatasokClient } from "./oktatasok-client";

export const dynamic = "force-dynamic";

export default async function OktatasokPage() {
  // Fetch active trainings from the database
  const activeTrainings = await db
    .select()
    .from(trainings)
    .where(eq(trainings.isActive, true))
    .orderBy(desc(trainings.createdAt));

  return <OktatasokClient trainings={activeTrainings} />;
}
