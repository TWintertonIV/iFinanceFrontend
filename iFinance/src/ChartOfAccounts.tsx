import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Trash2, Pencil } from "lucide-react";
import { useToken } from "./components/Login/useToken";

interface Account {
  id: number;
  name: string;
  openAmount: number;
  closeAmount: number;
  groupName: string;
}

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({
    name: "",
    openAmount: "",
    groupName: "",
  });
  const [groupOptions, setGroupOptions] = useState<string[]>([]);

  const [categoryMap] = useState<Record<number, string>>({});

  // Helper to map group path to group_id
  const [groupPathToId, setGroupPathToId] = useState<Record<string, number>>({});
  const { token } = useToken();
  // fetch group hierarchy and flatten to "Category/a/b/c" paths, and build path->id map
  useEffect(() => {
    const fetchGroups = async () => {
      const res = await fetch("https://ifinance-p4vg.onrender.com/api/group/get/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token.token}`,
        },
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data: {
        groups: Array<{
          group_name: string;
          category_id?: number;
          group_id: number;
          category: string;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          children: any[];
        }>;
      } = await res.json();
      const paths: string[] = [];
      const pathToId: Record<string, number> = {};
      // Helper to walk and prepend category name
      const walk = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        node: { group_name: string; category_id?: number; group_id: number; category: string; children?: any[] },
        prefix = ""
      ) => {
        // Always prepend the category to the path
        const catPrefix = node.category ? `${node.category}/` : "";
        const curr = prefix ? `${prefix}/${node.group_name}` : node.group_name;
        const fullPath = `${catPrefix}${curr}`;
        paths.push(fullPath);
        pathToId[fullPath] = node.group_id;
        if (node.children?.length) {
          node.children.forEach((c) => walk(c, curr));
        }
      };
      data.groups.forEach((g) => {
        walk(g, "");
      });
      setGroupOptions(paths);
      setGroupPathToId(pathToId);
      setForm((f) => ({ ...f, groupName: paths[0] || "" }));
    };
    fetchGroups();
    // rerun when categoryMap changes
  }, [categoryMap, token.token]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const response = await fetch("https://ifinance-p4vg.onrender.com/api/master-account/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Array<{
        id: number;
        name: string;
        opening_amount: number;
        closing_amount: number;
        account_group: string;
      }> = await response.json();
      setAccounts(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          openAmount: item.opening_amount,
          closeAmount: item.closing_amount,
          groupName: item.account_group,
        }))
      );
    };
    fetchAccounts();
  }, [token.token]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For openAmount, allow integers or decimals up to two places
    if (e.target.name === "openAmount") {
      const value = e.target.value;
      // Allow digits, optionally followed by a dot and up to two digits
      if (/^\d*(\.\d{0,2})?$/.test(value)) {
        setForm({ ...form, openAmount: value });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleGroupChange = (value: string) => {
    setForm({ ...form, groupName: value });
  };

  const handleAdd = async () => {
    // Validate name and amount (integer or decimal up to 2 places)
    if (
      !form.name ||
      !form.openAmount ||
      !/^\d+(\.\d{1,2})?$|^\d+$/.test(form.openAmount) // Allow integer or decimal
    ) {
      alert("Please enter a valid name and opening amount (e.g., 100 or 100.00)");
      return;
    }
    const group_id = groupPathToId[form.groupName];
    if (!group_id) {
      alert("Invalid group selected.");
      return;
    }

    // add .00 if integer
    let amountStr = form.openAmount;
    if (/^\d+$/.test(amountStr)) { // Integer
      amountStr += ".00";
    } else if (/^\d+\.\d$/.test(amountStr)) { // One decimal place
      amountStr += "0";
    }
    const amount = Number(amountStr);

    const response = await fetch("https://ifinance-p4vg.onrender.com/api/master-account/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token.token}`,
      },
      body: JSON.stringify({
        name: form.name,
        amount: amount,
        group_id,
      }),
    });
    if (!response.ok) {
      alert("Failed to create account.");
      return;
    }

    const fetchAccounts = async () => {
      const response = await fetch("https://ifinance-p4vg.onrender.com/api/master-account/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token.token}`,
        },
      }
      ); 
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Array<{
        id: number;
        name: string;
        opening_amount: number;
        closing_amount: number;
        account_group: string;
      }> = await response.json();
      setAccounts(
        data.map((item, idx) => ({
          key: idx,
          id: item.id,
          name: item.name,
          openAmount: item.opening_amount,
          closeAmount: item.closing_amount,
          groupName: item.account_group,
        }))
      );
    };
    await fetchAccounts();
    setForm({ name: "", openAmount: "", groupName: groupOptions[0] });
  };

  // Delete account handler
  const handleDelete = async (accountId: number) => {

    const response = await fetch("https://ifinance-p4vg.onrender.com/api/master-account/delete/", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token.token}`,
      },
      body: JSON.stringify({ account_id: accountId }),
    });
    if (!response.ok) {
      alert("Failed to delete account.");
      return;
    }
    // Remove from local state
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
  };

  // Edit account handler: populate form and set editingId
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleEdit = (acc: Account) => {
    setForm({
      name: acc.name,
      openAmount: acc.openAmount.toFixed(2),
      groupName:
      groupOptions.find(g => g === acc.groupName) ||
      groupOptions.find(g => g.includes(acc.groupName)) ||
      groupOptions[0],
    });
    setEditingId(acc.id);
  };

  // Update account handler
  const handleUpdate = async () => {
    // Validate name and amount (integer or decimal up to 2 places)
    if (
      !form.name ||
      !form.openAmount ||
      !/^\d+(\.\d{1,2})?$|^\d+$/.test(form.openAmount) ||
      editingId === null
    ) {
      alert("Please enter a valid name and opening amount (e.g., 100 or 100.00)");
      return;
    }
    
    const group_id = groupPathToId[form.groupName];
    if (!group_id) {
      alert("Invalid group selected.");
      return;
    }

    //add .00 if integer, ensure two decimal places
    let amountStr = form.openAmount;
    if (/^\d+$/.test(amountStr)) { // Integer
      amountStr += ".00";
    } else if (/^\d+\.\d$/.test(amountStr)) { // One decimal place
      amountStr += "0";
    }
    const amount = Number(amountStr);

    console.log("Updating account with ID:", editingId);
    const response = await fetch("https://ifinance-p4vg.onrender.com/api/master-account/put/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token.token}`,
      },
      body: JSON.stringify({
        account_id: editingId,
        name: form.name,
        amount: amount,
        group_id: group_id,
      }),
    });
    if (!response.ok) {
      alert("Failed to update account.");
      return;
    }
    // Refetch accounts
    const fetchAccounts = async () => {
      const response = await fetch("https://ifinance-p4vg.onrender.com/api/master-account/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Array<{
        id: number;
        name: string;
        opening_amount: number;
        closing_amount: number;
        account_group: string;
      }> = await response.json();
      setAccounts(
        data.map((item) => ({
          id: item.id,
          name: item.name,
          openAmount: item.opening_amount,
          closeAmount: item.closing_amount,
          groupName: item.account_group,
        }))
      );
    };
    await fetchAccounts();
    setForm({ name: "", openAmount: "", groupName: groupOptions[0] });
    setEditingId(null);
  };

  return (
    <>
      <SidebarProvider className="dark">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900">
            <SidebarTrigger className="-ml-1 text-white" />
            <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white text-center">Chart of Accounts Form</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Table */}
                <div className="overflow-x-auto rounded-lg mb-8">
                  <table className="min-w-full text-sm text-left text-gray-200">
                    <thead>
                      <tr className="bg-blue-900/60">
                        <th className="px-4 py-2">Number</th>
                        <th className="px-4 py-2">Account Name</th>
                        <th className="px-4 py-2">Open Amount</th>
                        <th className="px-4 py-2">Closing Amount</th>
                        <th className="px-4 py-2">Group Name</th>
                        <th className="px-4 py-2">Delete</th>
                        <th className="px-4 py-2">Edit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
                        <tr key={acc.id} className="border-b border-white/10 hover:bg-blue-900/20">
                          <td className="px-4 py-2">{acc.id}</td>
                          <td className="px-4 py-2">{acc.name}</td>
                          <td className="px-4 py-2">${acc.openAmount.toFixed(2)}</td>
                          <td className="px-4 py-2">${acc.closeAmount.toFixed(2)}</td>
                          <td className="px-4 py-2">{acc.groupName}</td>
                          <td className="px-4 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(acc.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(acc)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4 text-blue-400" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Add/Update Master Account Form */}
                <Card className="w-full max-w-4xl mx-auto bg-white/10 border-white/20 shadow-lg mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">
                      {editingId ? "Update Master Account" : "Add New Master Account"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="w-full">
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        if (editingId) {
                          handleUpdate();
                        } else {
                          handleAdd();
                        }
                      }}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-gray-300 mb-1" htmlFor="name">Account Name</label>
                          <Input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            className="bg-gray-800/50 border-gray-700 text-white"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-gray-300 mb-1" htmlFor="openAmount">Opening Amount</label>
                          <Input
                            id="openAmount"
                            name="openAmount"
                            type="text" // Keep as text to allow flexible input
                            inputMode="decimal" // Hint for mobile keyboards
                            value={form.openAmount}
                            onChange={handleFormChange}
                            className="bg-gray-800/50 border-gray-700 text-white"
                            required
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-gray-300 mb-1" htmlFor="groupName">Group Name</label>
                          <Select value={form.groupName} onValueChange={handleGroupChange}>
                            <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white w-full">
                              <SelectValue placeholder="Select group" />
                            </SelectTrigger>
                            <SelectContent
                              style={{
                                maxHeight: "20rem", // ~10 items at 2rem each
                                overflowY: groupOptions.length > 10 ? "auto" : "visible",
                              }}
                            >
                              {groupOptions.slice(0, 10).map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                              {groupOptions.length > 10 && (
                                groupOptions.slice(10).map((group) => (
                                  <SelectItem key={group} value={group}>
                                    {group}
                                  </SelectItem>
                                )))
                              }
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-4 mt-4">
                        <Button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 rounded"
                        >
                          {editingId ? "Update" : "Add"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/30 text-white"
                          onClick={() => {
                            setForm({ name: "", openAmount: "", groupName: groupOptions[0] });
                            setEditingId(null);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </CardContent>
              <CardDescription />
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
