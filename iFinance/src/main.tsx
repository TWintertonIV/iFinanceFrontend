import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./Login.tsx";
import ManageAccountGroup from "./ManageAccountGroup.tsx";
import ChartOfAccounts from "./ChartOfAccounts.tsx";
import DoubleEntryTransactions from "./DoubleEntryTransactions.tsx";
import Reports from "./Reports.tsx";
import AuthWrapper from "./components/Login/Authwrapper.tsx";
import ChangePassword from "./ChangePassword.tsx";
import AddUser from "./AddUser.tsx";
import AdminDashboard from "./AdminDashboard.tsx";
import LandingPage from "./LandingPage.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="/Login" element={<Login />} />
				<Route
					path="/ManageAccountGroup"
					element={
						<AuthWrapper admin={false}>
							<ManageAccountGroup />
						</AuthWrapper>
					}
				/>
				<Route
					path="/ChartOfAccounts"
					element={
						<AuthWrapper admin={false}>
							<ChartOfAccounts />
						</AuthWrapper>
					}
				/>
				<Route
					path="/DoubleEntryTransactions"
					element={
						<AuthWrapper admin={false}>
							<DoubleEntryTransactions />
						</AuthWrapper>
					}
				/>
				<Route
					path="/Reports"
					element={
						<AuthWrapper admin={false}>
							<Reports />
						</AuthWrapper>
					}
				/>
				<Route
					path="/ChangePassword"
					element={
						<AuthWrapper admin={false}>
							<ChangePassword />
						</AuthWrapper>
					}
				/>
				<Route
					path="/Dashboard"
					element={
						<AuthWrapper admin={false}>
							<LandingPage />
						</AuthWrapper>
					}
				/>
				<Route
					path="/AdminDashboard"
					element={
						<AuthWrapper admin={true}>
							<AdminDashboard />
						</AuthWrapper>
					}
				/>
				<Route
					path="/AddUser"
					element={
						<AuthWrapper admin={true}>
							<AddUser />
						</AuthWrapper>
					}
				/>
				<Route
					path="/EditUser/:id"
					element={
						<AuthWrapper admin={true}>
							<AddUser />
						</AuthWrapper>
					}
				/>
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
