import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToken } from "./components/Login/useToken";

// Placeholder for a simple chart (replace with a real chart lib if desired)
function GroupsPieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let acc = 0;
  return (
    <svg width={120} height={120} viewBox="0 0 32 32">
      {data.map((d) => {
        const start = acc / total;
        acc += d.value;
        const end = acc / total;
        const large = end - start > 0.5 ? 1 : 0;
        const a = 2 * Math.PI * start;
        const b = 2 * Math.PI * end;
        const x1 = 16 + 16 * Math.sin(a);
        const y1 = 16 - 16 * Math.cos(a);
        const x2 = 16 + 16 * Math.sin(b);
        const y2 = 16 - 16 * Math.cos(b);
        return (
          <path
            key={d.label}
            d={`M16,16 L${x1},${y1} A16,16 0 ${large} 1 ${x2},${y2} Z`}
            fill={d.color}
            stroke="#222"
            strokeWidth="0.2"
          />
        );
      })}
    </svg>
  );
}

export default function LandingPage() {
  const { token } = useToken(); // Assuming you have a useToken hook to get auth token
  // Placeholder: fetch accounts and groups from API in real app
  const [accounts, setAccounts] = useState<
    { id: number; name: string; balance: number; group: string }[]
  >([]);

  const [groupSummary, setGroupSummary] = useState<
    { label: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    // Fetch accounts from API
    fetch("https://ifinance-p4vg.onrender.com/api/master-account/list", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            // Add your authorization token if needed
            "Authorization": `${token.token}`,
        },
    }).then((res) => res.json())
      .then((data) => {
        setAccounts(
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.map((acc: any) => ({
            id: acc.id,
            name: acc.name,
            balance: acc.closing_amount,
            group: acc.account_group,
          }))
        );
      });

    // Fetch group summary from API
    fetch("https://ifinance-p4vg.onrender.com/api/group/get/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `${token.token}`,
        },
    })
      .then((res) => res.json())
      .then((data) => {
        // Aggregate group counts by category
        const colorMap: Record<string, string> = {
          Assets: "#60a5fa",
          Liabilities: "#f472b6",
          Income: "#34d399",
          Expenses: "#fbbf24",
        };
        const summary: Record<string, number> = {};
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        function countGroups(groups: any[]) {
          for (const g of groups) {
            summary[g.category] = (summary[g.category] || 0) + 1;
            if (g.children && g.children.length > 0) {
              countGroups(g.children);
            }
          }
        }
        countGroups(data.groups);
        setGroupSummary(
          Object.entries(summary).map(([label, value]) => ({
            label,
            value,
            color: colorMap[label] || "#888",
          }))
        );
      });
  }, [token.token]);

  const handleReportDownload = (url: string, filename: string) => {
    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/pdf",
            "Authorization": `${token.token}`,
        },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  return (
    <SidebarProvider className="dark">
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900">
          <SidebarTrigger className="-ml-1 text-white" />
          <Card className="w-full max-w-5xl mx-auto bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white text-center">
                Welcome to iFinance
              </CardTitle>
              <CardDescription className="text-center text-gray-300 mt-2">
                Here’s a quick overview of your accounts and groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
                {/* Accounts Overview */}
                <div className="flex-1 min-w-[200px]">
                  <h2 className="text-xl text-white font-semibold mb-2">Accounts</h2>
                  <div className="rounded-lg bg-gray-900/60 p-3">
                    <table className="w-full text-sm text-gray-200">
                      <thead>
                        <tr>
                          <th className="text-left">Name</th>
                          <th className="text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.slice(0, 4).map((acc) => (
                          <tr key={acc.id}>
                            <td>{acc.name}</td>
                            <td className="text-right">
                              {acc.balance < 0 ? (
                                <span className="text-red-400">-${Math.abs(acc.balance).toFixed(2)}</span>
                              ) : (
                                <span>${acc.balance.toFixed(2)}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Groups Pie Chart */}
                <div className="flex-1 flex flex-col items-center min-w-[180px]">
                  <h2 className="text-xl text-white font-semibold mb-2">Groups</h2>
                  <GroupsPieChart data={groupSummary} />
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {groupSummary.map((g) => (
                      <span
                        key={g.label}
                        className="flex items-center gap-1 text-xs"
                        style={{ color: g.color }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            background: g.color,
                            borderRadius: "50%",
                          }}
                        />
                        {g.label}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Quick Reports */}
                <div className="flex-1 min-w-[200px] flex flex-col items-center">
                  <h2 className="text-xl text-white font-semibold mb-2">Quick Reports</h2>
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 rounded flex items-center justify-between"
                      onClick={() =>
                        handleReportDownload(
                          "https://ifinance-p4vg.onrender.com/api/document/trial_balance/",
                          "trial_balance.pdf"
                        )
                      }
                    >
                      Trial Balance <Download className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 rounded flex items-center justify-between"
                      onClick={() =>
                        handleReportDownload(
                          "https://ifinance-p4vg.onrender.com/api/document/balance_sheet/",
                          "balance_sheet.pdf"
                        )
                      }
                    >
                      Balance Sheet <Download className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
