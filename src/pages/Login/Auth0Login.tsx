import styles from "./Login.module.scss";
import { useAuth0 } from "@auth0/auth0-react";

export const Auth0Login = () => {
    const { loginWithRedirect, user, isAuthenticated, isLoading, logout } = useAuth0();

    return (
        <div className={styles.ContentContainer}>
            <div className={styles.ChildContent}>
                <button onClick={() => loginWithRedirect()}>Log In</button>
                {
                    isLoading
                        ? <div>Loading ...</div>
                        : <div>
                            <img src={user?.picture} alt={user?.name} />
                            <h2>{user?.name}</h2>
                            <p>{user?.email}</p>
                            <button onClick={() => logout()}>Log Out</button>
                        </div>
                }
            </div>
        </div>
    )
}

export default Auth0Login;
