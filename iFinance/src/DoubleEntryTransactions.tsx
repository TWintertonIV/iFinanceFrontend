import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToken } from "./components/Login/useToken";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";
import { Trash2 } from "lucide-react";

// Define interfaces for fetched data
interface Group {
  group_name: string;
  group_id: number;
  category: string;
  category_id: number;
  children: Group[];
}

interface MasterAccount {
  name: string;
  opening_amount: number;
  closing_amount: number;
  account_group: string; // This is the group name
  id: number;
}

// Define the structure for processed account options
interface AccountOption {
  id: number;
  name: string;
  categoryId: number;
}


type Row = {
  account: string;
  debit: string;
  credit: string;
  notes: string;
};

export default function DoubleEntryTransactions() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState<Row[]>([
    { account: "", debit: "", credit: "", notes: "" },
    { account: "", debit: "", credit: "", notes: "" },
  ]);
  const [assetsIncomeAccounts, setAssetsIncomeAccounts] = useState<AccountOption[]>([]);
  const [liabilitiesExpensesAccounts, setLiabilitiesExpensesAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true); // Loading state
  const { token } = useToken();

  // State for transactions
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [showTransactions, setShowTransactions] = useState(false);
  const TX_PAGE_SIZE = 3;
  const [txPage, setTxPage] = useState(1);
  const [accountNameMap, setAccountNameMap] = useState<Record<number,string>>({});

  // Fetch and process account data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [groupsRes, accountsRes] = await Promise.all([
          fetch("https://ifinance-p4vg.onrender.com/api/group/get/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${token.token}`,
            },
          }),

          fetch("https://ifinance-p4vg.onrender.com/api/master-account/list", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${token.token}`,
            },
          }),
        ]);

        if (!groupsRes.ok || !accountsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const groupsData: { groups: Group[] } = await groupsRes.json();
        const accountsData: MasterAccount[] = await accountsRes.json();
        // build ID->name map
        const idMap: Record<number,string> = {};
        accountsData.forEach(acc => { idMap[acc.id] = acc.name; });
        setAccountNameMap(idMap);

        // Build a map from group name to category ID
        const groupNameToCategoryId: Record<string, number> = {};
        const walkGroups = (group: Group) => {
          groupNameToCategoryId[group.group_name] = group.category_id;
          group.children.forEach(walkGroups);
        };
        groupsData.groups.forEach(walkGroups);

        // Filter accounts based on category
        const assetsIncome: AccountOption[] = [];
        const liabilitiesExpenses: AccountOption[] = [];

        accountsData.forEach(acc => {
          const categoryId = groupNameToCategoryId[acc.account_group];
          const accountOption = { id: acc.id, name: acc.name, categoryId };

          if (categoryId === 1 || categoryId === 3) { // Assets or Income
            assetsIncome.push(accountOption);
          } else if (categoryId === 2 || categoryId === 4) { // Liabilities or Expenses
            liabilitiesExpenses.push(accountOption);
          }
        });

        setAssetsIncomeAccounts(assetsIncome);
        setLiabilitiesExpensesAccounts(liabilitiesExpenses);

      } catch (error) {
        console.error("Error fetching account data:", error);
        // Handle error state if needed
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
  }, [token.token]); // Empty dependency array means this runs once on mount

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const res = await fetch("https://ifinance-p4vg.onrender.com/api/transaction/get/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token.token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch transactions");
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchTransactions();
  }, [token.token]);

  const totalDebit = rows.reduce((sum, row) => sum + (parseFloat(row.debit) || 0), 0);
  const totalCredit = rows.reduce((sum, row) => sum + (parseFloat(row.credit) || 0), 0);

  const handleRowChange = (idx: number, field: keyof Row, value: string) => {
    setRows(rows => {
      const newRows = rows.map(r => ({ ...r }));
      const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;

      if (field === "debit") {
        newRows[idx].debit = value;
        newRows[idx].credit = "";
        if (newRows[pairIdx]) {
          newRows[pairIdx].credit = value;
          newRows[pairIdx].debit = "";
        }
      } else if (field === "credit") {
        newRows[idx].credit = value;
        newRows[idx].debit = "";
        if (newRows[pairIdx]) {
          newRows[pairIdx].debit = value;
          newRows[pairIdx].credit = "";
        }
      } else {
        newRows[idx][field] = value;
      }

      return newRows;
    });
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      { account: "", debit: "", credit: "", notes: "" },
      { account: "", debit: "", credit: "", notes: "" },
    ]);
  };

  const handleDeleteRows = () => {
    if (rows.length > 2) {
      setRows(rows.slice(0, -2));
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare the payload
    const lines = [];
    for (let i = 0; i < rows.length; i += 2) {
      const row1 = rows[i];
      const row2 = rows[i + 1];
      if (row1 && row2) {
        lines.push({
          fma_id: Number(row1.account) || null,
          sma_id: Number(row2.account) || null,
          debit_amount: parseFloat(row1.debit) || 0,
          credit_amount: parseFloat(row1.credit) || 0,
          comments: row1.notes,
        });
        lines.push({
          fma_id: Number(row2.account) || null,
          sma_id: Number(row1.account) || null,
          debit_amount: parseFloat(row2.debit) || 0,
          credit_amount: parseFloat(row2.credit) || 0,
          comments: row2.notes,
        });
      }
    }

    const payload = {
      date,
      description,
      author_id: token.user_id, // Hardcoded for now
      lines,
    };

    try {
      const res = await fetch("https://ifinance-p4vg.onrender.com/api/transaction/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit transaction");
      }

      // Optionally reset form or show success
      alert("Transaction submitted successfully!");
      setRows([
        { account: "", debit: "", credit: "", notes: "" },
        { account: "", debit: "", credit: "", notes: "" },
      ]);
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      // Refresh transactions after submit
      try {
        const res = await fetch("https://ifinance-p4vg.onrender.com/api/transaction/get/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token.token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to refresh transactions");
        }
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error("Error refreshing transactions:", err);
      }
    } catch (error) {
      alert("Error submitting transaction: " + (error as Error).message);
    }
  };

  const totalTxPages = Math.ceil(transactions.length / TX_PAGE_SIZE);
  const paginatedTx = transactions.slice(
    (txPage - 1) * TX_PAGE_SIZE,
    (txPage - 1) * TX_PAGE_SIZE + TX_PAGE_SIZE
  );
  const handleTxPageChange = (page: number) => {
    if (page >= 1 && page <= totalTxPages) setTxPage(page);
  };

  // delete handler
  const deleteTransaction = async (transactionId: number) => {
    if (!window.confirm(`Delete transaction #${transactionId}?`)) return;
    try {
      const res = await fetch("https://ifinance-p4vg.onrender.com/api/transaction/delete/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json",
          "Authorization": `${token.token}`,
         },
        body: JSON.stringify({ transaction_id: transactionId }),
      });
      if (res.ok) {
        setTransactions(prev => prev.filter(tx => tx.transaction_number !== transactionId));
      } else {
        alert("Failed to delete transaction");
      }
    } catch {
      alert("Network error");
    }
  };

  return (
    <>
      <SidebarProvider className="dark">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900 min-h-screen">
            <SidebarTrigger className="-ml-1 text-white" />

            {!showTransactions ? (
              <>
                {/* Entry Form View */}
                <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white text-center">
                      Double Entry Transaction Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-gray-300 mb-1" htmlFor="date">
                            Transaction Date
                          </label>
                          <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white"
                            required
                          />
                        </div>
                        <div className="flex-2">
                          <label className="block text-gray-300 mb-1" htmlFor="description">
                            Description
                          </label>
                          <Input
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="bg-gray-800/50 border-gray-700 text-white"
                          />
                        </div>
                    
                      </div>
                      <div className="mt-2">
                        <div className="grid grid-cols-12 gap-2 text-gray-400 text-sm mb-1">
                          <div className="col-span-4">Account</div>
                          <div className="col-span-2">Debit</div>
                          <div className="col-span-2">Credit</div>
                          <div className="col-span-4">Notes</div>
                        </div>
                        {rows.map((row, idx) => {
                         // Determine which account list to use based on row index
                         const currentAccountOptions = idx % 2 === 0 ? assetsIncomeAccounts : liabilitiesExpensesAccounts;
                         const hasOptions = currentAccountOptions.length > 0;
                          return (
                           <React.Fragment key={idx}>
                           {/* Add separator before every pair of rows after the first pair */}
                           {idx > 0 && idx % 2 === 0 && (
                             <hr className="col-span-12 border-t border-gray-600 my-2" />
                           )}
                            <div className="grid grid-cols-12 gap-2 mb-2">
                              <div className="col-span-4">
                                <Select
                                  value={row.account}
                                  onValueChange={val => handleRowChange(idx, "account", val)}
                                  disabled={loading || !hasOptions} // Disable if loading or no options
                                >
                                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white w-full">
                                    <SelectValue placeholder={loading ? "Loading..." : (hasOptions ? "Select account" : "No accounts available")} />
                                  </SelectTrigger>
                                  {hasOptions && (
                                    <SelectContent>
                                      {currentAccountOptions.map(option => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                          {option.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  )}
                                </Select>
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={row.debit}
                                  onChange={e => handleRowChange(idx, "debit", e.target.value)}
                                  disabled={!!row.credit}
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                  placeholder="$0.00"
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={row.credit}
                                  onChange={e => handleRowChange(idx, "credit", e.target.value)}
                                  disabled={!!row.debit}
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                  placeholder="$0.00"
                                />
                              </div>
                              <div className="col-span-4">
                                <Input
                                  value={row.notes}
                                  onChange={e => handleRowChange(idx, "notes", e.target.value)}
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                  placeholder=""
                                />
                              </div>
                            </div>
                         </React.Fragment>
                          );
                        })}
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/30 text-white"
                            onClick={handleAddRow}
                          >
                            Add Transaction Pair
                          </Button>
                         <Button
                           type="button"
                           variant="outline"
                           className="border-white/30 text-white"
                           onClick={handleDeleteRows}
                           disabled={rows.length <= 2}
                         >
                           Delete Last Pair
                         </Button>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                        <div className="text-gray-200 text-lg">
                          Total Debit: <span className="font-mono">${totalDebit.toFixed(2)}</span>
                        </div>
                        <div className="text-gray-200 text-lg">
                          Total Credit: <span className="font-mono">${totalCredit.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 mt-4">
                        <Button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 rounded"
                        >
                          Submit Transaction
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/30 text-white"
                          onClick={() => {
                            setRows([
                              { account: "", debit: "", credit: "", notes: "" },
                              { account: "", debit: "", credit: "", notes: "" },
                            ]);
                            setDescription("");
                            setDate(new Date().toISOString().slice(0, 10));
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 text-white"
                  onClick={() => setShowTransactions(true)}
                >
                  View Transactions
                </Button>
              </>
            ) : (
              <>
                {/* Transactions List View */}
                <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white text-center">
                      All Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="text-gray-300">Loading transactions...</div>
                    ) : paginatedTx.length === 0 ? (
                      <div className="text-gray-300">No transactions found.</div>
                    ) : (
                      <div className="space-y-6">
                        {paginatedTx.map(tx => (
                          <div key={tx.transaction_number} className="bg-gray-900/40 rounded-lg p-4 border border-gray-700">
                            <div className="grid grid-cols-4 items-center gap-2 mb-4">
                              <div>
                                <span className="text-gray-400">Transaction #</span>
                                <span className="text-white font-mono ml-1">{tx.transaction_number}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Date:</span>
                                <span className="text-white font-mono ml-1">{tx.transaction_date}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Description:</span>
                                <span className="text-white ml-1">{tx.description}</span>
                              </div>
                              <div className="text-right">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="p-1"
                                  onClick={() => deleteTransaction(tx.transaction_number)}
                                >
                                  <Trash2 className="h-4 w-4 text-white"/>
                                </Button>
                              </div>
                            </div>
                            {tx.lines && tx.lines.length > 0 && (
                              <div className="mt-3 overflow-x-auto">
                                <table className="min-w-full text-sm text-gray-200">
                                  <thead>
                                    <tr>
                                      <th className="px-2 py-1 text-left">Debit</th>
                                      <th className="px-2 py-1 text-left">Credit</th>
                                      <th className="px-2 py-1 text-left">First Account</th>
                                      <th className="px-2 py-1 text-left">Second Account</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    
                                    {//eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    tx.lines.map((line: any, idx: number) => (
                                      <tr key={idx} className="border-t border-gray-700">
                                        <td className="px-2 py-1">{line.debit_amount}</td>
                                        <td className="px-2 py-1">{line.credit_amount}</td>
                                        <td className="px-2 py-1">
                                          {accountNameMap[line.first_master_account] ?? line.first_master_account}
                                        </td>
                                        <td className="px-2 py-1">
                                          {accountNameMap[line.second_master_account] ?? line.second_master_account}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* paginator */}
                    <div className="mt-4 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={e => { e.preventDefault(); handleTxPageChange(txPage - 1); }}
                              aria-disabled={txPage === 1}
                            />
                          </PaginationItem>
                          {[...Array(totalTxPages)].map((_, idx) => (
                            <PaginationItem key={idx}>
                              <PaginationLink
                                href="#"
                                isActive={txPage === idx + 1}
                                onClick={e => { e.preventDefault(); handleTxPageChange(idx + 1); }}
                              >
                                {idx + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          {totalTxPages > 5 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={e => { e.preventDefault(); handleTxPageChange(txPage + 1); }}
                              aria-disabled={txPage === totalTxPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </CardContent>
                </Card>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/30 text-white"
                  onClick={() => setShowTransactions(false)}
                >
                  Back to Entry
                </Button>
              </>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
