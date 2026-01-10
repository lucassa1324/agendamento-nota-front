import { SiteCustomizer } from "@/components/admin/site-customizer";

export default function PersonalizacaoPage() {
  return (
    <div className="mx-auto max-w-none h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <SiteCustomizer />
      </div>
    </div>
  );
}
