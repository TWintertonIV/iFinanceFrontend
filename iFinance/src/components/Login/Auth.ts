//To do, basically will check Auth and redirect to the main page if failed

import { getToken } from "./useToken";
import LoginModel from "../../interfaces/login.model";

export default async function Auth() {
  const token: LoginModel = getToken();
  if (!token) {
    console.log("No token found");
    return { validation: false, admin: false };
  }
  try {
    const response = await fetch("https://ifinance-p4vg.onrender.com/api/token/validate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${token.token}`,
      },
      body: JSON.stringify({
        user_id: token.user_id,
        token: token.token?.substring(6),
      }),
    });

    const data = await response.json();
    if (data.token_status === "token valid" && data.admin_flag === false) {
      console.log("Token is valid");
      return { validation: true, admin: false };
    } else if (data.token_status === "token valid" && data.admin_flag === true) {
      console.log("Token is valid and user is admin");
      return { validation: true, admin: true };
    } else {
      console.log("Token is invalid");
      return { validation: false, admin: false };
    }
  } catch (error) {
    console.error("Error validating token:", error);
    return { validation: false, admin: false };
  }
}
