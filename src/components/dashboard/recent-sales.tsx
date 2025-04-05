'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentSales = [
  {
    name: "John Doe",
    email: "john@example.com",
    amount: "₹2,500",
    date: "2024-03-20",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    amount: "₹1,800",
    date: "2024-03-19",
  },
  {
    name: "Mike Johnson",
    email: "mike@example.com",
    amount: "₹3,200",
    date: "2024-03-18",
  },
  {
    name: "Sarah Williams",
    email: "sarah@example.com",
    amount: "₹2,100",
    date: "2024-03-17",
  },
  {
    name: "David Brown",
    email: "david@example.com",
    amount: "₹1,900",
    date: "2024-03-16",
  },
];

export function RecentSales() {
  return (
    <div className="space-y-8">
      {recentSales.map((sale) => (
        <div key={sale.email} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/avatars/${sale.name.toLowerCase().replace(' ', '-')}.png`} alt={sale.name} />
            <AvatarFallback>{sale.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className="ml-auto font-medium">{sale.amount}</div>
        </div>
      ))}
    </div>
  );
} 