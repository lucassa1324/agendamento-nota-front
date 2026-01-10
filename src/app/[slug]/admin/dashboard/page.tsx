import { use } from "react";
import { redirect } from "next/navigation";

export default function DashboardPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(paramsPromise);
  redirect(`/${slug}/admin/dashboard/overview`);
}
