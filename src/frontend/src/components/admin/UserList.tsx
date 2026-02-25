import { useGetAllUsers } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { UserClass } from '../../backend';

function formatClass(userClass: UserClass): string {
  switch (userClass) {
    case UserClass.eleventh: return '11th';
    case UserClass.twelfth: return '12th';
    case UserClass.dropper: return 'Dropper';
    default: return String(userClass);
  }
}

export default function UserList() {
  const { data: users, isLoading } = useGetAllUsers();

  return (
    <Card className="border border-gray-100 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-navy flex items-center gap-2">
          <Users className="h-5 w-5" />
          Registered Users ({users?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-bold text-navy">#</TableHead>
                  <TableHead className="font-bold text-navy">Full Name</TableHead>
                  <TableHead className="font-bold text-navy">Class</TableHead>
                  <TableHead className="font-bold text-navy">Contact Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="text-gray-400 text-sm">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-navy">{user.fullName}</TableCell>
                    <TableCell>
                      <span className="bg-navy/10 text-navy text-xs font-semibold px-2.5 py-1 rounded-full">
                        {formatClass(user.userClass)}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.contactNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No users registered yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
