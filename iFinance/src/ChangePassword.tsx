import { useState } from "react";
import {useToken} from "./components/Login/useToken";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardTitle,
} from "./components/ui/card";
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "./components/ui/input";

export default function ChangePassword() {
    const [passwordValue, setPasswordValue] = useState("");
    const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
    const [oldPasswordValue, setOldPasswordValue] = useState("");
    const [error, setError] = useState("");
    const { token } = useToken();
    return (
        <>
    <SidebarProvider className="dark">
    <AppSidebar />
    <SidebarInset>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-gray-900 to-blue-900 p-4">
    <SidebarTrigger className="-ml-1 text-white" />
        <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardTitle className="text-white text-2xl text-center">Change Password</CardTitle>
            <CardDescription className="text-gray-300 text-center">
                Please enter your new password below.
            </CardDescription>
            <CardContent className="flex flex-col items-center gap-4">
            <Input
                id="old-password"
                type="password"
                placeholder="Old Password"
                className="w-3/4 p-2 rounded bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setOldPasswordValue(e.target.value)}
            />
            <Input
                id="password"
                type="password"
                placeholder="New Password"
                className="w-3/4 p-2 rounded bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                onChange={(e) => setPasswordValue(e.target.value)}
            />
            <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm Password"
                className="w-3/4 p-2 rounded bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setConfirmPasswordValue(e.target.value)}
            />
            <Button className="w-3/4 p-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => {
                if(passwordValue !== confirmPasswordValue) {
                    setError("Passwords do not match");
                }
                else if(passwordValue.length < 7) {
                    setError("Password must be at least 7 characters long");
                }
                else {
                    setError("");
                    async function changePassword() {
                        const response = await fetch("https://ifinance-p4vg.onrender.com/api/password/change/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `${token.token}`,
                            },
                            body: JSON.stringify({
                               user_id: token.user_id,
                               new_password: passwordValue,
                               old_password: oldPasswordValue,
                            }),
                        });
                        if (!response.ok) {
                            throw new Error("Failed to change password");
                        }
                    }

                    changePassword()
                        .then(() => {
                            alert("Password changed successfully");
                        }
                        )
                        .catch((error) => { 
                            console.error("Error changing password:", error);
                            setError("Failed to change password. Try Again.");
                        })
                }
            }}>
                Submit
            </Button>
            <CardFooter>{error}</CardFooter>
        </CardContent>
        </Card>
    </div>
    </SidebarInset>
    </SidebarProvider>
    </>
    );
    }
