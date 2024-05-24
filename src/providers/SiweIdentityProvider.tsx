/* eslint-disable */
import React, {
    createContext,
    useContext,
    type ReactNode,
    useEffect,
    useState,
    useRef,
} from "react";
import {type ActorConfig, type HttpAgentOptions} from "@dfinity/agent";
import {DelegationIdentity, Ed25519KeyIdentity} from "@dfinity/identity";
import type {SiweIdentityContextType} from "../icp/siwe-identity-utils/context.type";
import {IDL} from "@dfinity/candid";
import type {
    LoginOkResponse,
    SIWE_IDENTITY_SERVICE,
    SignedDelegation as ServiceSignedDelegation,
} from "../icp/siwe-identity-utils/service.interface";
import {
    callGetDelegation,
    callLogin,
    callPrepareLogin,
    createAnonymousActor,
} from "../icp/siwe-identity-utils/siwe-provider";
import type {State} from "../icp/siwe-identity-utils/state.type";
import {createDelegationChain} from "../icp/siwe-identity-utils/delegation";
import {normalizeError} from "../icp/siwe-identity-utils/error";
import {useDispatch, useSelector} from "react-redux";
import {clearSiweIdentity, selectSiweIdentity, updateSiweIdentity} from "../redux/reducers/siweIdentitySlice";
import {SignerContext} from "./SignerProvider";
import {NotificationType, openNotification} from "../utils/notification";
import {RootState} from "../redux/store";
import {Typography} from "antd";
import ICPLoading from "../components/ICPLoading/ICPLoading";

/**
 * Re-export types
 */
export * from "../icp/siwe-identity-utils/context.type";
export * from "../icp/siwe-identity-utils/service.interface";
export * from "../icp/siwe-identity-utils/storage.type";

/**
 * React context for managing SIWE (Sign-In with Ethereum) identity.
 */
export const SiweIdentityContext = createContext<
    SiweIdentityContextType | undefined
>(undefined);

/**
 * Hook to access the SiweIdentityContext.
 */
export const useSiweIdentity = (): SiweIdentityContextType => {
    const context = useContext(SiweIdentityContext);
    if (!context) {
        throw new Error(
            "useSiweIdentity must be used within an SiweIdentityProvider"
        );
    }
    return context;
};

/**
 * Provider component for the SIWE identity context. Manages identity state and provides authentication-related functionalities.
 *
 * @prop {IDL.InterfaceFactory} idlFactory - Required. The Interface Description Language (IDL) factory for the canister. This factory is used to create an actor interface for the canister.
 * @prop {string} canisterId - Required. The unique identifier of the canister on the Internet Computer network. This ID is used to establish a connection to the canister.
 * @prop {HttpAgentOptions} httpAgentOptions - Optional. Configuration options for the HTTP agent used to communicate with the Internet Computer network.
 * @prop {ActorConfig} actorOptions - Optional. Configuration options for the actor. These options are passed to the actor upon its creation.
 * @prop {ReactNode} children - Required. The child components that the SiweIdentityProvider will wrap. This allows any child component to access the authentication context provided by the SiweIdentityProvider.
 *
 * @example
 * ```tsx
 * import { SiweIdentityProvider } from 'ic-use-siwe-identity';
 * import {canisterId, idlFactory} from "path-to/siwe-enabled-canister/index";
 * import { _SERVICE } from "path-to/siwe-enabled-canister.did";
 *
 * function App() {
 *   return (
 *     <SiweIdentityProvider<_SERVICE>
 *       idlFactory={idlFactory}
 *       canisterId={canisterId}
 *       // ...other props
 *     >
 *       {... your app components}
 *     </App>
 *   );
 * }
 *
 * import { SiweIdentityProvider } from "ic-use-siwe-identity";
 *```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SiweIdentityProvider<T extends SIWE_IDENTITY_SERVICE>({
                                                                          httpAgentOptions,
                                                                          actorOptions,
                                                                          idlFactory,
                                                                          canisterId,
                                                                          children,
                                                                      }: {
    /** Configuration options for the HTTP agent used to communicate with the Internet Computer network. */
    httpAgentOptions?: HttpAgentOptions;

    /** Configuration options for the actor. These options are passed to the actor upon its creation. */
    actorOptions?: ActorConfig;

    /** The Interface Description Language (IDL) factory for the canister. This factory is used to create an actor interface for the canister. */
    idlFactory: IDL.InterfaceFactory;

    /** The unique identifier of the canister on the Internet Computer network. This ID is used to establish a connection to the canister. */
    canisterId: string;

    /** The child components that the SiweIdentityProvider will wrap. This allows any child component to access the authentication context provided by the SiweIdentityProvider. */
    children: ReactNode;
}) {
    const siweIdentity = useSelector(selectSiweIdentity);
    const dispatch = useDispatch();
    const {signer} = useContext(SignerContext);
    const userInfo = useSelector((state: RootState) => state.userInfo);

    const [state, setState] = useState<State>({
        isInitializing: true,
        prepareLoginStatus: "idle",
        loginStatus: "idle",
    });

    useEffect(() => {
        if (state.anonymousActor && !siweIdentity) {
            console.log("Trying siwe login...");
            tryLogin();
        }
    }, [siweIdentity, state.anonymousActor]);

    async function tryLogin() {
        try {
            await login();
            openNotification(
                "Authenticated",
                `Login succeed. Welcome ${userInfo.legalName}!`,
                NotificationType.SUCCESS
            );
        } catch (e) {
            console.error("Error in SiweIdentityProvider", e);
            openNotification("Error", "Error while logging in", NotificationType.ERROR);
        }
    }

    const signMessageEthers = async (message: string) => {
        return signer?.signMessage(message);
    }

    async function updateState(newState: Partial<State>) {
        setState((prevState) => ({
            ...prevState,
            ...newState,
        }));
    }

    // Keep track of the promise handlers for the login method during the async login process.
    const loginPromiseHandlers = useRef<{
        resolve: (
            value: DelegationIdentity | PromiseLike<DelegationIdentity>
        ) => void;
        reject: (error: Error) => void;
    } | null>(null);

    /**
     * Load a SIWE message from the provider, to be used for login. Calling prepareLogin
     * is optional, as it will be called automatically on login if not called manually.
     */
    async function prepareLogin(): Promise<string | undefined> {
        const connectedEthAddress = (signer?.address || '0xabc') as `0x${string}`;
        if (!state.anonymousActor) {
            throw new Error(
                "Hook not initialized properly. Make sure to supply all required props to the SiweIdentityProvider."
            );
        }
        if (!connectedEthAddress) {
            throw new Error(
                "No Ethereum address available. Call prepareLogin after the user has connected their wallet."
            );
        }

        updateState({
            prepareLoginStatus: "preparing",
            prepareLoginError: undefined,
        });

        try {
            const siweMessage = await callPrepareLogin(
                state.anonymousActor,
                connectedEthAddress
            );
            updateState({
                siweMessage,
                prepareLoginStatus: "success",
            });
            return siweMessage;
        } catch (e) {
            const error = normalizeError(e);
            console.error(error);
            updateState({
                prepareLoginStatus: "error",
                prepareLoginError: error,
            });
        }
    }

    async function rejectLoginWithError(
        error: Error | unknown,
        message?: string
    ) {
        const e = normalizeError(error);
        const errorMessage = message || e.message;

        console.error(e);

        updateState({
            siweMessage: undefined,
            loginStatus: "error",
            loginError: new Error(errorMessage),
        });

        loginPromiseHandlers.current?.reject(new Error(errorMessage));
    }

    /**
     * This function is called when the signMessage hook has settled, that is, when the
     * user has signed the message or canceled the signing process.
     */
    async function onLoginSignatureSettled(
        loginSignature: `0x${string}` | undefined,
        error: Error | null
    ) {
        const connectedEthAddress = (signer?.address || '0xabc') as `0x${string}`;
        if (error) {
            rejectLoginWithError(
                error,
                "An error occurred while signing the login message."
            );
            return;
        }
        if (!loginSignature) {
            rejectLoginWithError(new Error("Sign message returned no data."));
            return;
        }

        // Important for security! A random session identity is created on each login.
        const sessionIdentity = Ed25519KeyIdentity.generate();
        const sessionPublicKey = sessionIdentity.getPublicKey().toDer();

        if (!state.anonymousActor || !connectedEthAddress) {
            rejectLoginWithError(new Error("Invalid actor or address."));
            return;
        }

        // Logging in is a two-step process. First, the signed SIWE message is sent to the backend.
        // Then, the backend's siwe_get_delegation method is called to get the delegation.

        let loginOkResponse: LoginOkResponse;
        try {
            loginOkResponse = await callLogin(
                state.anonymousActor,
                loginSignature,
                connectedEthAddress,
                sessionPublicKey
            );
        } catch (e) {
            rejectLoginWithError(e, "Unable to login.");
            return;
        }

        // Call the backend's siwe_get_delegation method to get the delegation.
        let signedDelegation: ServiceSignedDelegation;
        try {
            signedDelegation = await callGetDelegation(
                state.anonymousActor,
                connectedEthAddress,
                sessionPublicKey,
                loginOkResponse.expiration
            );
        } catch (e) {
            rejectLoginWithError(e, "Unable to get identity.");
            return;
        }

        // Create a new delegation chain from the delegation.
        const delegationChain = createDelegationChain(
            signedDelegation,
            loginOkResponse.user_canister_pubkey
        );

        // Create a new delegation identity from the session identity and the
        // delegation chain.
        const identity = DelegationIdentity.fromDelegation(
            sessionIdentity,
            delegationChain
        );

        // Save the identity to local storage.
        dispatch(updateSiweIdentity({
            address: connectedEthAddress,
            sessionIdentity: JSON.stringify(sessionIdentity.toJSON()),
            delegationChain: JSON.stringify(delegationChain.toJSON()),
        }));

        // Set the identity in state.
        await updateState({
            loginStatus: "success",
            identityAddress: connectedEthAddress,
            identity,
            delegationChain,
        });

        loginPromiseHandlers.current?.resolve(identity);

        // The signMessage hook is reset so that it can be used again.
        // reset();
    }

    /**
     * Initiates the login process. If a SIWE message is not already available, it will be
     * generated by calling prepareLogin.
     *
     * @returns {void} Login does not return anything. If an error occurs, the error is available in
     * the loginError property.
     */

    async function login() {
        const connectedEthAddress = signer?.address || '';
        const promise = new Promise<DelegationIdentity>((resolve, reject) => {
            loginPromiseHandlers.current = {resolve, reject};
        });
        // Set the promise handlers immediately to ensure they are available for error handling.

        if (!state.anonymousActor) {
            rejectLoginWithError(
                new Error(
                    "Hook not initialized properly. Make sure to supply all required props to the SiweIdentityProvider."
                )
            );
            return promise;
        }
        if (!connectedEthAddress) {
            rejectLoginWithError(
                new Error(
                    "No Ethereum address available. Call login after the user has connected their wallet."
                )
            );
            return promise;
        }
        if (state.prepareLoginStatus === "preparing") {
            rejectLoginWithError(
                new Error("Don't call login while prepareLogin is running.")
            );
            return promise;
        }

        updateState({
            loginStatus: "logging-in",
            loginError: undefined,
        });

        try {
            // The SIWE message can be prepared in advance, or it can be generated as part of the login process.
            let siweMessage = state.siweMessage;
            if (!siweMessage) {
                siweMessage = await prepareLogin();
                if (!siweMessage) {
                    throw new Error(
                        "Prepare login failed did not return a SIWE message."
                    );
                }
            }
            const loginSignature = await signMessageEthers(siweMessage);
            // @ts-ignore
            await onLoginSignatureSettled(loginSignature, null);
            // signMessage(
            //   { message: siweMessage },
            //   {
            //     onSettled: onLoginSignatureSettled,
            //   }
            // );
        } catch (e) {
            rejectLoginWithError(e);
        }

        return promise;
    }

    /**
     * Clears the state and local storage. Effectively "logs the user out".
     */
    function clear() {
        updateState({
            isInitializing: false,
            prepareLoginStatus: "idle",
            prepareLoginError: undefined,
            siweMessage: undefined,
            loginStatus: "idle",
            loginError: undefined,
            identity: undefined,
            identityAddress: undefined,
            delegationChain: undefined,
        });
        dispatch(clearSiweIdentity());
    }

    /**
     * Load the identity from local storage on mount.
     */
    useEffect(() => {
        if (!siweIdentity) {
            updateState({
                isInitializing: false,
            });
        }
        updateState({
            identityAddress: siweIdentity?.address,
            identity: siweIdentity?.sessionIdentity,
            delegationChain: siweIdentity?.delegationChain,
            isInitializing: false,
        });
    }, []);

    /**
     * On address change, reset the state. Action is conditional on state.isInitializing
     * being false.
     */
    useEffect(() => {
        if (state.isInitializing) return;
        clear();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Create an anonymous actor on mount. This actor is used during the login
     * process.
     */
    useEffect(() => {
        const a = createAnonymousActor({
            idlFactory,
            canisterId,
            httpAgentOptions,
            actorOptions,
        });
        updateState({
            anonymousActor: a,
        });
    }, [idlFactory, canisterId, httpAgentOptions, actorOptions]);

    if (!signer) {
        return <Typography.Text>
            Signer not available
        </Typography.Text>
    }
    const isLoggingIn = state.loginStatus === "logging-in";
    if (isLoggingIn) {
        return <ICPLoading/>
    }
    return (
        <SiweIdentityContext.Provider
            value={{
                ...state,
                prepareLogin,
                isPreparingLogin: state.prepareLoginStatus === "preparing",
                isPrepareLoginError: state.prepareLoginStatus === "error",
                isPrepareLoginSuccess: state.prepareLoginStatus === "success",
                isPrepareLoginIdle: state.prepareLoginStatus === "idle",
                login,
                isLoggingIn,
                isLoginError: state.loginStatus === "error",
                isLoginSuccess: state.loginStatus === "success",
                isLoginIdle: state.loginStatus === "idle",
                clear,
            }}
        >
            {children}
        </SiweIdentityContext.Provider>
    );
}
