import { redirect } from "next/navigation";
import { use } from "react";

export default function DashboardPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(paramsPromise);
  redirect(`/admin/${slug}/dashboard/overview`);
}
