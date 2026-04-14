// src/context/UserProvider.jsx
import { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "./UserContext";

export default function UserProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // Decodifica el token actual solo cuando token cambia
    const user = useMemo(() => {
        if (!token) return null;
        try {
            return jwtDecode(token);
        } catch (error) {
            console.error("Token inválido:", error);
            return null;
        }
    }, [token]);

    // Guarda el token en localStorage y actualiza el estado
    const saveUser = useCallback((newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }, []);

    // Limpia la sesión eliminando el token
    const clearUser = useCallback(() => {
        setToken(null);
        localStorage.removeItem("token");
    }, []);

    // Retorna la información decodificada del token
    const decodeToken = useCallback(() => {
        return user;
    }, [user]);

    // Verifica si el rol del usuario está dentro de los roles permitidos
    // El token guarda rol como string: "administrador" | "vendedor" | "comprador"
    // Uso: authorize(["administrador", "vendedor"])
    const authorize = useCallback(
        (requiredRoles = []) => {
            if (!user || !user.rol) return false;
            return requiredRoles.includes(user.rol);
        },
        [user]
    );

    const isAuthenticated = !!token && !!user;

    const contextValue = useMemo(
        () => ({
            token,
            user,
            isAuthenticated,
            saveUser,
            clearUser,
            decodeToken,
            authorize,
        }),
        [token, user, isAuthenticated, saveUser, clearUser, decodeToken, authorize]
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};