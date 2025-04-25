import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { useNavigate } from "react-router-dom";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "./components/ui/pagination";
import { useEffect, useState, useMemo } from "react";
import UserModel from "./interfaces/user.model";
import BackendUserModel from "./interfaces/backendUser.model";
import { useToken } from "./components/Login/useToken";

const PAGE_SIZE = 50; // Number of users per page

export default function AdminDashboard() {
    const { token } = useToken(); // Get authentication token
	const navigate = useNavigate(); // For navigation
	const [allUsers, setAllUsers] = useState<UserModel[]>([]); // All users fetched from backend
	const [users, setUsers] = useState<UserModel[]>([]); // Users for current page
	const [currentPage, setCurrentPage] = useState(1); // Current page number

	// Fetch all users from backend API
	const fetchUsers = async () => {
		const response = await fetch("https://ifinance-p4vg.onrender.com/api/usr/get/", {
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

	useEffect(() => {
		// Fetch and transform user data on mount
		const fetchData = async () => {
			try {
				const fetchedUsers = await fetchUsers();
                console.log(fetchedUsers);
				const userModels: UserModel[] = fetchedUsers.map((user: BackendUserModel) => ({
					id: user.user_id ? user.user_id : 0,
					username: user.username ? user.username : "N/A",
					name: user.name ? user.name : "N/A",
					email: user.email ? user.email : "N/A",
					isAdmin: user.is_admin ? user.is_admin : false,
					address: user.address ? user.address : "N/A",
					date_hired: user.date_hired ? user.date_hired : "-",
					date_finished: user.date_finished ? user.date_finished : "-",
				}));
				setAllUsers(userModels);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		// Update users for current page when allUsers or currentPage changes
		const start = (currentPage - 1) * PAGE_SIZE;
		const end = start + PAGE_SIZE;
		setUsers(allUsers.slice(start, end));
	}, [allUsers, currentPage]);

	const totalPages = Math.ceil(allUsers.length / PAGE_SIZE); // Total number of pages

	const userRows = useMemo(() => {
		// Count the number of admins in the system
		const adminCount = allUsers.filter(user => user.isAdmin).length;

		// Render table rows for users
		return users.map((user, idx) => (
			<tr
				key={user.id !== 0 ? user.id : `fallback-${idx}`}
				className="border-b border-white/10 hover:bg-blue-900/20"
			>
				<td className="px-4 py-2">{user.id}</td>
				<td className="px-4 py-2">{user.username}</td>
				<td className="px-4 py-2">{user.name}</td>
				<td className="px-4 py-2">{user.email}</td>
				<td className="px-4 py-2">{user.isAdmin ? "Yes" : "No"}</td>
				<td className="px-4 py-2">{user.address}</td>
				<td className="px-4 py-2">{user.date_hired || "-"}</td>
				<td className="px-4 py-2">{user.date_finished || "-"}</td>
				<td className="px-4 py-2 flex gap-2">
					{/* Edit button */}
					<Button
						size="sm"
						className="bg-blue-400 hover:bg-emerald-700 text-white px-3 py-1 rounded"
						onClick={() => {
							navigate(`/EditUser/${user.id}`);
						}}
					>
						Edit
					</Button>
					{/* Delete button, disabled if only one admin remains */}
					<Button
						size="sm"
						className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
						disabled={user.isAdmin && allUsers.filter(u => u.isAdmin).length === 1}
						title={
							user.isAdmin && allUsers.filter(u => u.isAdmin).length === 1
								? "Cannot delete the only admin"
								: undefined
						}
						onClick={async () => {
							if (
								user.isAdmin &&
								adminCount === 1
							) {
								return;
							}
							if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
								try {
									const res = await fetch(`https://ifinance-p4vg.onrender.com/api/usr/delete/`, {
										method: "DELETE",
										headers: {
											"Content-Type": "application/json",
											"Authorization": `${token.token}`,
										},
										body: JSON.stringify({ user_id: user.id }),
									});
									if (res.ok) {
										setAllUsers(prev => prev.filter(u => u.id !== user.id));
									} else {
										alert("Failed to delete user.");
									}
								} catch {
									alert("Network error.");
								}
							}
						}}
					>
						Delete
					</Button>
				</td>
			</tr>
		));
	}, [users, navigate, token, allUsers]);

	// Handle pagination page change
	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	return (
		<>
			<div className="width-full h-screen flex flex-col">
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900 p-4">
                    <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl mx-auto my-20">
						<CardHeader>
							<h1 className="text-3xl font-bold text-white"> Admin Dashboard</h1>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm text-left text-gray-200">
									<thead>
										<tr className="bg-blue-900/60">
											<th className="px-4 py-2">ID</th>
											<th className="px-4 py-2">Username</th>
											<th className="px-4 py-2">Name</th>
											<th className="px-4 py-2">Email</th>
											<th className="px-4 py-2">Admin</th>
											<th className="px-4 py-2">Address</th>
											<th className="px-4 py-2">Date Hired</th>
											<th className="px-4 py-2">Date Finished</th>
											<th className="px-4 py-2">Actions</th>
										</tr>
									</thead>
									<tbody>
										{userRows}
									</tbody>
								</table>
							</div>
						</CardContent>
						<CardFooter className="flex w-full gap-4 justify-between items-left">
							{/* Pagination controls */}
							<div className="flex items-left p-0 m-0 w-md">
								<Pagination className="w-auto m-0">
									<PaginationContent>
										<PaginationItem className="text-white">
											<PaginationPrevious
												href="#"
												onClick={e => {
													e.preventDefault();
													handlePageChange(currentPage - 1);
												}}
												aria-disabled={currentPage === 1}
											/>
										</PaginationItem>
										{[...Array(totalPages)].map((_, idx) => (
											<PaginationItem key={idx}>
												<PaginationLink
													href="#"
													isActive={currentPage === idx + 1}
													onClick={e => {
														e.preventDefault();
														handlePageChange(idx + 1);
														}}
													className={
														currentPage === idx + 1
															? "bg-blue-600 text-white font-bold rounded shadow"
															: "text-white hover:bg-blue-800 hover:text-white rounded"
													}
												>
													{idx + 1}
												</PaginationLink>
											</PaginationItem>
										))}
										{totalPages > 5 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
										<PaginationItem className="text-white">
											<PaginationNext
												href="#"
												onClick={e => {
													e.preventDefault();
													handlePageChange(currentPage + 1);
												}}
												aria-disabled={currentPage === totalPages}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
							{/* Action buttons */}
							<div className="flex justify-end gap-4">
								<Button
									className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
									onClick={() => {
										localStorage.removeItem("token");
										navigate("/Login");
									}}
								>
									Log Out
								</Button>
								<Button
									className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
									onClick={() => {
										navigate("/AddUser");
									}}
								>
									Add User
								</Button>
							</div>
						</CardFooter>
					</Card>
				</div>
			</div>
		</>
	);
}
