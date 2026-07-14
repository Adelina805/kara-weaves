import { redirect } from "next/navigation";
import { getPrimaryOrder } from "@/lib/mvp/sample-data";

export default function BuyerDashboardIndexPage() {
  const order = getPrimaryOrder();
  redirect(`/buyer-dashboard/${order.buyerPublicToken}`);
}
