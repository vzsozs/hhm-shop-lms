"use client";

import { TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

interface UserTableRowProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
}

export function UserTableRow({ userId, children, className }: UserTableRowProps) {
  const router = useRouter();

  return (
    <TableRow
      className={`${className} cursor-pointer`}
      onClick={() => router.push(`/admin/users/${userId}`)}
    >
      {children}
    </TableRow>
  );
}
