"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, login as loginRequest, register as registerRequest, type AuthUser } from "@/lib/api/auth";

type LoginInput = {
	email: string;
	password: string;
};

type RegisterInput = {
	name?: string;
	email: string;
	password: string;
	verificationCode: string;
};

type AuthContextValue = {
	user: AuthUser | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (input: LoginInput) => Promise<void>;
	register: (input: RegisterInput) => Promise<void>;
	logout: () => void;
	refreshCurrentUser: () => Promise<void>;
};

const TOKEN_STORAGE_KEY = "meba.auth.token";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const url = new URL(window.location.href);
		const tokenFromQuery = url.searchParams.get("token");

		if (tokenFromQuery) {
			localStorage.setItem(TOKEN_STORAGE_KEY, tokenFromQuery);
			setToken(tokenFromQuery);
			url.searchParams.delete("token");
			url.searchParams.delete("provider");
			window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
		}
	}, []);

	const refreshCurrentUser = useCallback(async () => {
		if (!token) {
			setUser(null);
			return;
		}

		try {
			const response = await getCurrentUser(token);
			setUser(response.user);
		} catch {
			setUser(null);
			setToken(null);
			localStorage.removeItem(TOKEN_STORAGE_KEY);
		}
	}, [token]);

	useEffect(() => {
		const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

		if (!storedToken) {
			setIsLoading(false);
			return;
		}

		setToken(storedToken);
	}, []);

	useEffect(() => {
		let isMounted = true;

		async function syncUser() {
			if (!token) {
				if (isMounted) {
					setUser(null);
					setIsLoading(false);
				}
				return;
			}

			try {
				const response = await getCurrentUser(token);

				if (isMounted) {
					setUser(response.user);
				}
			} catch {
				if (isMounted) {
					setUser(null);
					setToken(null);
					localStorage.removeItem(TOKEN_STORAGE_KEY);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void syncUser();

		return () => {
			isMounted = false;
		};
	}, [token]);

	const login = useCallback(async (input: LoginInput) => {
		const response = await loginRequest(input);
		setUser(response.user);
		setToken(response.token);
		localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
	}, []);

	const register = useCallback(async (input: RegisterInput) => {
		const response = await registerRequest(input);
		setUser(response.user);
		setToken(response.token);
		localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
	}, []);

	const logout = useCallback(() => {
		setUser(null);
		setToken(null);
		localStorage.removeItem(TOKEN_STORAGE_KEY);
	}, []);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			token,
			isAuthenticated: Boolean(user && token),
			isLoading,
			login,
			register,
			logout,
			refreshCurrentUser
		}),
		[user, token, isLoading, login, register, logout, refreshCurrentUser]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
