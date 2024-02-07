import {
  createAgent,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
} from "@veramo/core";
import { DIDManager, MemoryDIDStore } from "@veramo/did-manager";
import {
  KeyManager,
  MemoryKeyStore,
  MemoryPrivateKeyStore,
} from "@veramo/key-manager";
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { KeyManagementSystem } from "@veramo/kms-local";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { CredentialPlugin, ICredentialVerifier } from "@veramo/credential-w3c";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";
import { Resolver } from "did-resolver";
import { MessageHandler } from "@veramo/message-handler";
import { DIDComm, DIDCommMessageHandler, IDIDComm } from "@veramo/did-comm";

const INFURA_PROJECT_ID = "14bc392775034b3d80988f5211a95985";

export const agent = createAgent<
  IKeyManager &
    IDIDManager &
    IResolver &
    ICredentialVerifier &
    IMessageHandler &
    IDIDComm
>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      defaultProvider: "did:ethr:goerli",
      providers: {
        "did:ethr:goerli": new EthrDIDProvider({
          defaultKms: "local",
          network: "goerli",
          rpcUrl: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
      }),
    }),
    new CredentialPlugin(),
    new MessageHandler({
      messageHandlers: [new DIDCommMessageHandler()],
    }),
    new DIDComm(),
  ],
});
