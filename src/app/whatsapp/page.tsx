import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WhatsAppInbox } from "@/components/whatsapp/WhatsAppInbox";

export const metadata: Metadata = {
  title: "WhatsApp Inbox | Boop",
  description: "Manage your WhatsApp messages",
};

export default async function WhatsAppPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-10">
      <WhatsAppInbox />
    </div>
  );
} 