import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Eye,
    EyeClosed
} from "lucide-react";
import { useToken } from "./components/Login/useToken";
import UserModel from "./interfaces/user.model";

// Main component for adding or editing a user
export default function AddUser() {
	const { token } = useToken(); // Get authentication token and user info
	const navigate = useNavigate(); // For navigation after actions
	const { id } = useParams<{ id?: string }>(); // Get user id from route params
	const isEdit = !!id; // Determine if editing or adding

	// Form state for user fields
	const [form, setForm] = useState({
		username: "",
		password: "",
		name: "",
		email: "",
		admin_id: token.user_id, // The admin creating the user
		address: "",
		user_type: "user", // "user" or "admin"
		dateHired: "",
		dateFinished: "",
	});
	const [loading, setLoading] = useState(false); // Loading state for submit
	const [error, setError] = useState(""); // Error message
	const [success, setSuccess] = useState(""); // Success message
	const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

	useEffect(() => {
		// Fetch user data if editing
		const fetchUser = async (userId: string) => {
			try {
				const response = await fetch(`https://ifinance-p4vg.onrender.com/api/usr/get/?user_id=${userId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `${token.token}`,
					},
				});
				if (response.ok) {
					const user: UserModel = await response.json();
					console.log(user);
					setForm({
						username: user.username,
						password: "",
						name: user.name,
						email: user.email,
						admin_id: user.id,
						address: user.address,
						user_type: user.is_admin ? "admin" : "user",
						dateHired: user.dateHired || "",
						dateFinished: user.dateFinished || "",
					});
				} else {
					setError("Failed to fetch user data.");
				}
			} catch {
				setError("Network error while fetching user.");
			}
		};
		if (isEdit && id) {
			fetchUser(id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEdit, id]);

	// Handle input changes for all fields
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === "checkbox" ? (checked ? "admin" : "user") : value,
		}));
	};

	// Handle form submission for add/edit user
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");
		try {
			const url = isEdit 
				? "https://ifinance-p4vg.onrender.com/api/usr/put/" 
				: "https://ifinance-p4vg.onrender.com/api/usr/create/";
			const method = isEdit ? "PUT" : "POST";
			const payload = isEdit
				? { user_id: Number(id), password: form.password, address: form.address }
				: {
						username: form.username,
						password: form.password,
						name: form.name,
						email: form.email,
						admin_id: form.admin_id,
						address: form.address,
						user_type: form.user_type,
						dateHired: form.user_type === "admin" ? form.dateHired : "",
						dateFinished: form.user_type === "admin" ? form.dateFinished : "",
				  };

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `${token.token}`,
				},
				body: JSON.stringify(payload),
			});
			console.log(payload);
			if (response.ok) {
				setSuccess(isEdit ? "User updated successfully!" : "User added successfully!");
				if (!isEdit) {
					// Reset form after successful add
					setForm({
						username: "",
						password: "",
						name: "",
						email: "",
						admin_id: token.user_id,
						address: "",
						user_type: "user",
						dateHired: "",
						dateFinished: "",
					});
				}
				setTimeout(() => {
					setSuccess("");
					navigate("/AdminDashboard");
				}, 1200);
			} else {
				const data = await response.json();
				setError(data?.non_field_errors || data?.error || "Failed to submit user.");
			}
		} catch {
			setError("Network error.");
		}
		setLoading(false);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
			<Card className="w-full max-w-lg bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
				<CardHeader>
					<CardTitle className="text-3xl font-bold text-white">
						{isEdit ? "Edit User" : "Add New User"}
					</CardTitle>
					<CardDescription className="text-gray-300">
						{isEdit ? "Update the user information below." : "Fill out the form to add a new user."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-5">
						{/* Username field */}
						<div>
							<label className="block text-gray-300 mb-1" htmlFor="username">Username</label>
							<Input
								id="username"
								name="username"
								value={form.username}
								onChange={handleChange}
								disabled={isEdit}
								className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
								required
							/>
						</div>
						{/* Password field with show/hide toggle */}
						<div>
							<label className="block text-gray-300 mb-1" htmlFor="password">
								Password {isEdit && <span className="text-xs text-gray-400">(will overwrite existing)</span>}
							</label>
							<div className="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									value={form.password}
									onChange={handleChange}
									className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
									placeholder={isEdit ? "••••••••" : ""}
									autoComplete="new-password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(prev => !prev)}
									className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
									tabIndex={-1}
								>
									{showPassword ? <EyeClosed /> : <Eye />}
								</button>
							</div>
						</div>
						{/* Name field */}
						<div>
							<label className="block text-gray-300 mb-1" htmlFor="name">Name</label>
							<Input
								id="name"
								name="name"
								value={form.name}
								onChange={handleChange}
								disabled={isEdit}
								className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
								required
							/>
						</div>
						{/* Email field */}
						<div>
							<label className="block text-gray-300 mb-1" htmlFor="email">Email</label>
							<Input
								id="email"
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								disabled={isEdit}
								className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
								required
							/>
						</div>
						{/* Address field, disabled for admin users */}
						<div>
							<label className="block text-gray-300 mb-1" htmlFor="address">Address</label>
							<Input
								id="address"
								name="address"
								value={form.address}
								onChange={handleChange}
								className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
								disabled={form.user_type === "admin"}
							/>
						</div>
						{/* Checkbox for admin user type */}
						{!isEdit && (
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="user_type"
									name="user_type"
									checked={form.user_type === "admin"}
									onChange={e => setForm(prev => ({ ...prev, user_type: e.target.checked ? "admin" : "user" }))}
									className="w-4 h-4 accent-blue-500"
								/>
								<label htmlFor="user_type" className="text-gray-300 select-none">
									Admin User
								</label>
							</div>
						)}
						{/* Date fields for admin users only */}
						{!isEdit && form.user_type === "admin" && (
							<>
								<div>
									<label className="block text-gray-300 mb-1" htmlFor="dateHired">
										Date Hired
									</label>
									<Input
										id="dateHired"
										name="dateHired"
										type="date"
										value={form.dateHired}
										onChange={handleChange}
										className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
									/>
								</div>
								<div>
									<label className="block text-gray-300 mb-1" htmlFor="dateFinished">
										Date Finished
									</label>
									<Input
										id="dateFinished"
										name="dateFinished"
										type="date"
										value={form.dateFinished}
										onChange={handleChange}
										className="bg-gray-800/50 border-gray-700 text-white focus-visible:ring-0"
									/>
								</div>
							</>
						)}
						{/* Error and success messages */}
						{error && <div className="text-red-400">{error}</div>}
						{success && <div className="text-green-400">{success}</div>}
						{/* Form buttons */}
						<CardFooter className="flex justify-end p-0 m-0 gap-2">
							<Button
								type="submit"
								className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded"
								disabled={loading}
							>
								{loading ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update User" : "Add User")}
							</Button>
							<Button
								className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded mx-2"
								type="button"
								onClick={() => navigate("/AdminDashboard")}
							>
								Cancel
							</Button>
						</CardFooter>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
