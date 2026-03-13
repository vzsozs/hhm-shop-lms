import { db } from "@/db";
import { users, profiles } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";
import { TestEmailButton } from "./test-email-button";
import { auth } from "@/auth";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  
  const usersList = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      profileName: profiles.name,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .orderBy(desc(users.createdAt));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-brand-orange" size={28} />
            Felhasználók
          </h1>
          <p className="text-sm text-white/50 mt-1">Az összes regisztrált Shop és LMS fiók kezelése.</p>
        </div>
        <TestEmailButton />
      </div>

      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b-white/10 hover:bg-transparent">
                <TableHead className="text-white">Név</TableHead>
                <TableHead className="text-white">Email</TableHead>
                <TableHead className="text-white">Státusz</TableHead>
                <TableHead className="text-white">Szerepkör</TableHead>
                <TableHead className="text-white text-right">Regisztráció date</TableHead>
                <TableHead className="text-white text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((user) => {
                const dateAdded = user.createdAt.toLocaleDateString("hu-HU", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                
                const displayName = user.profileName || "Nincs megadva";
                const isAdmin = user.role === "admin";
                const isVerified = !!user.emailVerified;

                return (
                  <TableRow key={user.id} className="border-b-white/5 hover:bg-white/5 border-b last:border-0 transition-colors">
                    <TableCell className="font-medium text-white">{displayName}</TableCell>
                    <TableCell className="text-white/70">{user.email}</TableCell>
                    <TableCell>
                      {isVerified ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                          Megerősítve
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                          Függőben
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          isAdmin 
                            ? "bg-orange-500 text-white border-orange-500/20" 
                            : "bg-neutral-800 text-neutral-300 border-neutral-700"
                        }
                      >
                        {isAdmin ? "Admin" : "User"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-white/70 text-sm whitespace-nowrap">{dateAdded}</TableCell>
                    <TableCell className="text-right">
                      <UserActions userId={user.id} currentRole={user.role} currentUserId={currentUserId} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {usersList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-white/50">
                    Nincsenek felhasználók az adatbázisban.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
