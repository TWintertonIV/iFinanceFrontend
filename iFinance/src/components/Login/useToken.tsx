import { useState } from "react";
import LoginModel from "../../interfaces/login.model";

export const getToken = () => {
	if(!localStorage.getItem("token")) {
		return null;
	}
	const tokenString = localStorage.getItem("token");
	const userToken = JSON.parse(tokenString || "{}");
	if (userToken.date) {
		const tokenDate = new Date(userToken.date);
		const currentDate = new Date();
		const timeDifference = currentDate.getTime() - tokenDate.getTime();
		const hoursDifference = timeDifference / (1000 * 60 * 60);
		if (hoursDifference > 24) {
			localStorage.removeItem("token");
			return null;
		}
	}

	return userToken;
};

export const useToken = () => {
	const [token, setToken] = useState(getToken());
	const saveToken = (userToken: LoginModel) => {
		if (localStorage.getItem("token")) {
			localStorage.removeItem("token");
		}
		localStorage.setItem("token", JSON.stringify(userToken));
		setToken(userToken);
	};
	return {
		setToken: saveToken,
		token,
	};
};
