import { db } from "@/db";
import { users, profiles, addresses } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { UserForm } from "@/components/admin/users/UserForm";
import { notFound } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AdminUserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminUserEditPage({ params }: AdminUserEditPageProps) {
  const { id } = await params;

  // Felhasználó alap adatok
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    notFound();
  }

  // Profil adatok
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, id),
  });

  // Cím adatok
  const userAddresses = await db.query.addresses.findMany({
    where: eq(addresses.userId, id),
  });

  const billingAddress = userAddresses.find((a) => a.type === "billing");
  const shippingAddress = userAddresses.find((a) => a.type === "shipping");

  const initialValues = {
    role: user.role,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    phone: profile?.phone,
    lang: profile?.lang || "hu",
    expertise: profile?.expertise,
    interests: profile?.interests,
    
    billing_country: billingAddress?.country,
    billing_zip: billingAddress?.zip,
    billing_city: billingAddress?.city,
    billing_street: billingAddress?.street,
    billing_companyName: billingAddress?.companyName,
    billing_taxNumber: billingAddress?.taxNumber,

    shipping_country: shippingAddress?.country,
    shipping_zip: shippingAddress?.zip,
    shipping_city: shippingAddress?.city,
    shipping_street: shippingAddress?.street,
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-white/50 mb-4 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/5">
        <Link href="/admin/users" className="hover:text-white transition-colors flex items-center gap-2">
          <Users size={14} className="text-brand-orange" />
          Felhasználók
        </Link>
        <ChevronRight size={14} className="text-white/20" />
        <span className="text-white font-medium truncate">
          {profile?.name || user.email} szerkesztése
        </span>
      </nav>

      <UserForm 
        userId={id} 
        email={user.email} 
        initialData={initialValues} 
      />
    </div>
  );
}
