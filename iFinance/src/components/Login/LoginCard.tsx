import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function LoginCard({
	setPassword,
	setEmail,
	submitLogin,
	email,
	password,
	isLoading,
	error,
}: {
	setPassword: (password: string) => void;
	setEmail: (email: string) => void;
	submitLogin: () => void;
	email: string;
	password: string;
	isLoading: boolean;
	error?: string;
}) {
	return (
		<Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
			<CardHeader>
				<CardTitle className="text-2xl font-bold text-white">
					Sign In
				</CardTitle>

				<CardDescription className="text-gray-300">
					Enter your credentials to access your account
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-5">
				<div className="space-y-1">
					<Label htmlFor="email" className="text-gray-300">
						Username
					</Label>

					<Input
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="finance-input focus-visible:ring-0"
						placeholder="JohnDoe"
						required
					/>
				</div>

				<div className="space-y-1">
					<div className="flex justify-between">
						<Label htmlFor="password" className="text-gray-300">
							Password
						</Label>
					</div>

					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="finance-input focus-visible:ring-0"
						placeholder="••••••••"
						required
					/>
				</div>

				<Button
					onClick={submitLogin}
					disabled={isLoading}
					className="w-full finance-button"
				>
					{isLoading ? (
						<svg
							className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							></circle>

							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					) : null}

					{isLoading ? "Signing In..." : "Sign In"}
				</Button>

				{error && (
					<div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
						{error}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default LoginCard;
