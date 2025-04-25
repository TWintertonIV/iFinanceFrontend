import Category from "./interfaces/category.model";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "./components/ui/card";
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {TreeView, TreeDataItem} from "@/components/tree-view"
import { useEffect, useState, useCallback } from "react";
import { useToken } from "./components/Login/useToken";
import { Input } from "./components/ui/input";

function ManageAccountGroup() {
	const [treeItems, setTreeItems] = useState<TreeDataItem[]>([]);
	const { token } = useToken();

	const fetchCategories = async () => {
		const response = await fetch("https://ifinance-p4vg.onrender.com/api/group/get/", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `${token.token}`,
			},
		});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		};


	const [name, setName] = useState("");
	const [selected, setSelected] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<number>(-1);
	const [error, setError] = useState<string | null>(null);
	const [categoryList, setCategoryList] = useState<Array<{name:string; id:number}>>([]);
	const [rootCategories, setRootCategories] = useState<Array<{name: string; id: number}>>([]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	};


	const addGroup = useCallback(
		async (parentID: number, depth:number) => {

			if (!name.trim()) {
				setError("Group name cannot be empty");
				return;
			}

			let body: string = "";
			if( parentID === 0){
				body =  JSON.stringify({
					name: name,
					account_id: selectedCategory
				});
			}else{
				body = JSON.stringify({
					name: name,
					parent_id: parentID,
					account_id: selectedCategory
				});
			}

			const response = await fetch("https://ifinance-p4vg.onrender.com/api/group/create/", {
				method: "Post",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `${token.token}`,
				},
				body: body,
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const newGroup = await response.json();
			setError(null); // Clear any previous error
			setName(""); // Clear the input field after successful addition
			console.log("New Group Added:", newGroup);
			const newTreeItem = convertGroupToTreeItem(newGroup, depth);
			setTreeItems(prev => [...prev, newTreeItem]);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[token.token, token.user_id, name]   // removed convertGroupToTreeItem
	);

	const editGroup = useCallback(
		async (groupID: number) => {

			if (!name.trim()) {
				setError("Group name cannot be empty");
				return;
			}

			const response = await fetch("https://ifinance-p4vg.onrender.com/api/group/put/", {
				method: "Put",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `${token.token}`,
				},
				body: JSON.stringify({
					group_id: groupID,
					name: name,
					account_id: selectedCategory //wrong, add logic
				}),
			});
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			setError(null); // Clear any previous error
			setName(""); // Clear the input field after successful addition
			const fetchData = async () => {
				try {
					const { groups } = await fetchCategories();
					const categories = ["Assets", "Liabilities", "Expenses", "Income"];
					const rootItems: TreeDataItem[] = categories.map(cat => {
						// only include fetched groups matching this category
						const children = groups
							.filter((g: Category) => g.category === cat)
							.map((g: Category) => convertGroupToTreeItem(g, 1));
						// root‐level actions: only allow "Add" under each root
						const actions = (
							<div key="actions" role="group" className="flex gap-1">
								<Button disabled tabIndex={-1}>Edit</Button>
								<Button type="button" tabIndex={-1} onClick={() => addGroup(0, 1)}>Add</Button>
								<Button disabled tabIndex={-1}>Delete</Button>
							</div>
						);
						return { id: cat, name: cat, children, actions };
					});
					setTreeItems(rootItems);
				} catch (error) {
					console.error("Error fetching groups:", error);
				}
			};
			fetchData();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[token.token, token.user_id, name]   // removed convertGroupToTreeItem
	);

	const deleteGroup = useCallback(
		async (groupID: number, children: TreeDataItem[]) => {
			if( children.length > 0) {
				setError("Cannot delete a group with children. Please remove the children first.");
				return;
			}
			
			const response = await fetch("https://ifinance-p4vg.onrender.com/api/group/delete/", {
				method: "Delete",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `${token.token}`,
				},
				body: JSON.stringify({
					group_id: groupID
				}),
			});
			if (!response.ok) {
				const errorText = await response.text();
				const cleanedErrorText = errorText.replace(/[^a-zA-Z0-9 ]/g, "").trim();
				setError(cleanedErrorText || "Network response was not ok");
				return;
			}
			setError(null); // Clear any previous error
			setName(""); // Clear the input field after successful addition
			fetchCategories();
			const fetchData = async () => {
				try {
					const { groups } = await fetchCategories();
					const categories = ["Assets", "Liabilities", "Expenses", "Income"];
					const rootItems: TreeDataItem[] = categories.map(cat => {
						// only include fetched groups matching this category
						const children = groups
							.filter((g: Category) => g.category === cat)
							.map((g: Category) => convertGroupToTreeItem(g, 1));
						// root‐level actions: only allow "Add" under each root
						const actions = (
							<div key="actions" role="group" className="flex gap-1">
								<Button disabled tabIndex={-1}>Edit</Button>
								<Button type="button" tabIndex={-1} onClick={() => addGroup(0, 1)}>Add</Button>
								<Button disabled tabIndex={-1}>Delete</Button>
							</div>
						);
						return { id: cat, name: cat, children, actions };
					});
					setTreeItems(rootItems);
				} catch (error) {
					console.error("Error fetching groups:", error);
				}
			};
			fetchData();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[token.token, name]                  // removed convertGroupToTreeItem
	);

	function convertGroupToTreeItem(group: Category, depth = 0): TreeDataItem {
		const children = (group.children || []).map(child =>
			convertGroupToTreeItem(child, depth + 1)
		);
		// Always attach category_id to every TreeItem, ensure it's a number or undefined
		const rawCategoryId = group.category_id ?? group.category;
		const category_id: number | undefined =
			typeof rawCategoryId === "number"
				? rawCategoryId
				: typeof rawCategoryId === "string"
				? Number(rawCategoryId)
				: undefined;
		const actions = (
			<div key="actions" role="group" className="flex gap-1">
				{depth >= 1 && (
					<>
						<Button type="button" tabIndex={-1} onClick={() => {editGroup(group.group_id!)}}>Edit</Button>
						<Button type="button" tabIndex={-1} onClick={() => addGroup(group.group_id!, depth)}>Add</Button>
						<Button type="button" tabIndex={-1} onClick={() => {deleteGroup(group.group_id!, children)}}>Delete</Button>
					</>
				)}
				{depth < 1 && (
					<>
						<Button disabled type="button" tabIndex={-1} onClick={() => {}}>Edit</Button>
						<Button type="button" tabIndex={-1} onClick={() => addGroup(group.group_id!, depth)}>Add</Button>
						<Button disabled type="button" tabIndex={-1} onClick={() => {/* handle delete */}}>Delete</Button>
					</>
				)}
			</div>
		);
		return children.length
			? { id: String(group.group_id), name: group.group_name!, children, category_id, actions }
			: { id: String(group.group_id), name: group.group_name!, category_id, actions };
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { groups } = await fetchCategories();
				const rootItems: TreeDataItem[] = rootCategories.map(root => {
					const children = groups
						.filter((g: Category) => g.category === root.name)
						.map((g: Category) => convertGroupToTreeItem(g, 1));
					const actions = (
						<div key="actions" role="group" className="flex gap-1">
							<Button disabled tabIndex={-1}>Edit</Button>
							<Button type="button" tabIndex={-1} onClick={() => addGroup(0, 1)}>Add</Button>
							<Button disabled tabIndex={-1}>Delete</Button>
						</div>
					);
					// Attach category_id to root node
					return { id: root.name, name: root.name, category_id: root.id, children, actions };
				});
				setTreeItems(rootItems);
			} catch (error) {
				console.error("Error fetching groups:", error);
			}
		};
		fetchData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addGroup, rootCategories]);
	
  // fetch master category list once and store root category ids
  useEffect(() => {
    const fetchMasterCategories = async () => {
      const res = await fetch("https://ifinance-p4vg.onrender.com/api/categories/list", {
		method: "GET",
		headers: {
		  "Content-Type": "application/json",
		  "Authorization": `${token.token}`,
		},
	  });
      if (!res.ok) throw new Error("Failed to load categories");
      const data: Array<{name:string; id:number}> = await res.json();
      setCategoryList(data);
      // Only keep the four root categories
      const roots = ["Assets", "Liabilities", "Expenses", "Income"];
      setRootCategories(
        roots.map(name => {
          const found = data.find(c => c.name === name);
          return { name, id: found ? found.id : -1 };
        })
      );
    };
    fetchMasterCategories();
  }, [token.token]);

	// Combined handler for selection and accordion clicks
	const handleTreeItemInteraction = useCallback((item: TreeDataItem | undefined) => {
		if (item) {
			setSelected(true);
			let catId = (item as TreeDataItem).category_id;
			if (typeof catId !== "number") {
				// Lookup by name if category_id is missing (e.g., root nodes)
				const match = categoryList.find(c => c.name === item.name);
				catId = match?.id ?? -1;
			}
			setSelectedCategory(catId);
		} else {
			setSelected(false);
			setSelectedCategory(-1);
		}
	}, [categoryList]); // Dependency ensures the handler uses the latest categoryList



	return (
	<>
		<SidebarProvider className="dark">
		<AppSidebar />
		<SidebarInset>
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900 p-4">
		<SidebarTrigger className="-ml-1 text-white" />
			<Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-white text-center">
					Manage Account Groups
				</CardTitle>
			</CardHeader>
				<CardContent>
					<TreeView 
						data={treeItems}
						onSelectChange={handleTreeItemInteraction}
					/>
					<Input type="text" placeholder="Name" className="absolute bottom-2 right-57 mt-4 w-1/4" onChange = {handleChange} value={name}/>
					{error && <p className="text-red-500 text-sm mt-2">{error}</p>}
					{!selected && (
						<div className = "absolute bottom-2 right-2">
							<Button disabled type="button" className = "mr-1" >Edit</Button>
							<Button disabled type="button" >Add</Button>
							<Button disabled type="button" className = "ml-1">Delete</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
		</SidebarInset>
		</SidebarProvider>
	</>
);
}

export default ManageAccountGroup;