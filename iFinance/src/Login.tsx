import "./App.css";
import LoginCard from "@/components/Login/LoginCard";
import { useEffect, useRef, useState } from "react"; // <-- add useRef
import LoginModel from "./interfaces/login.model";
import { useToken } from "./components/Login/useToken";
import { useNavigate } from "react-router-dom";
import Auth from "./components/Login/Auth";

async function submitLogin(
	setToken: (tokenModel: LoginModel) => void,
	setError: (error: string) => void,
	setIsLoading: (isLoading: boolean) => void,
	setIsLoggedIn: (isLoggedIn: boolean) => void,
	email: string,
	password: string
) {
	setIsLoading(true);
	try{
		const response = await fetch("https://ifinance-p4vg.onrender.com/api/token/authenticate/", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: email,
				password: password,
			}),
		});
		if (!response.ok) {
			setIsLoading(false);
			setError("Login failed. Please check your credentials.");
			console.error("Login failed with status:", response.status);
			return;
		}
		if (response.ok) {
			const data = await response.json();
			const tokenModel: LoginModel = {
				token: data.token,
				user_id: data.user_id,
				name: data.name,
				time: new Date(),
			};
			setToken(tokenModel);
			setIsLoading(false);
			setIsLoggedIn(true);
			console.log(data);
		} else {
			console.log("Login failed");
			setError("Login failed");
			setIsLoading(false);
		}
	}	catch (error) {
		setIsLoading(false);
		setError("Network error. Please try again later.");
		console.error("Network error:", error);
		return;
	}
	
}

export default function App() {
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const navigator = useNavigate();
	const { setToken } = useToken();
	const logoRef = useRef<HTMLHeadingElement>(null);
	const [typedText, setTypedText] = useState("");
	const slogan = "Manage your finances with ease";
	const [showCursor, setShowCursor] = useState(true);

	useEffect(() => {
		let i = 0;
		let timeout: NodeJS.Timeout;
		function type() {
			if (i <= slogan.length) {
				setTypedText(slogan.slice(0, i));
				i++;
				timeout = setTimeout(type, 38);
			}
		}
		type();
		return () => clearTimeout(timeout);
	}, []);

	// Blinking cursor effect
	useEffect(() => {
		const interval = setInterval(() => {
			setShowCursor((c) => !c);
		}, 500);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const fetchAuth = async () => {
			try {
				const result = await Auth();
				console.log("Authentication result:", result);
				if (result.validation === true && result.admin === false) {
					navigator("/Dashboard");
				} else if (result.validation === true && result.admin === true) {
					navigator("/AdminDashboard");
				} else {

					console.log("Authentication failed, redirecting to login");

					localStorage.removeItem("token");
					navigator("/Login");
				}
			} catch (error) {
				console.error("Authentication error:", error);
			}
		};
		fetchAuth();
	}, [navigator]);

	useEffect(() => {
		if (isLoggedIn) {
			navigator("/Dashboard");
		}
	}, [isLoggedIn, navigator]);

	// Subtle welcome animation using WAAPI and AnimeJS's easeInOutQuad
	useEffect(() => {
		if (logoRef.current) {
			const animation = logoRef.current.animate(
				[
					{ opacity: 0, transform: "scale(0.96)" },
					{ opacity: 1, transform: "scale(1)" }
				],
				{
					duration: 900,
					fill: "forwards",
					easing: "cubic-bezier(0.455, 0.03, 0.515, 0.955)" // AnimeJS easeInOutQuad
				}
			);
			return () => animation.cancel();
		}
	}, []);

	return (
		<>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
				<div className="w-full max-w-md">
					{/* Logo and Branding */}
					<div className="text-center mb-10">
						<h1
							ref={logoRef}
							className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
						>
							iFinance
						</h1>
						<p className="mt-3 text-gray-300 font-mono">
							{typedText}
							<span
								style={{
									opacity: showCursor ? 1 : 0,
									display: "inline-block",
									verticalAlign: "baseline",
									fontSize: "1em",
									lineHeight: "1",
									transform: "translateY(2px)"
								}}
							>
								|
							</span>
						</p>
					</div>
					{/* Card Component */}
					<LoginCard
						setPassword={setPassword}
						setEmail={setEmail}
						submitLogin={() =>
							submitLogin(
								setToken,
								setError,
								setIsLoading,
								setIsLoggedIn,
								email,
								password
							)
						}
						email={email}
						password={password}
						isLoading={isLoading}
						error={error}
					/>
					{/* Footer with Link */}
					<div className="mt-8 text-center">
						<p className="text-gray-400 text-sm mb-2">
							© 2025 iFinance. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
