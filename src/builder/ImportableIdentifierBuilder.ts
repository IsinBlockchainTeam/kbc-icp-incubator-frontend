import { MinimalImportableIdentifier } from "@veramo/core";

export class ImportableIdentifierBuilder {
  public static build = (
    did: string,
    ethPrivateKey: string,
    subjectName: string
  ): MinimalImportableIdentifier => ({
    controllerKeyId: `${subjectName}-controller-key`,
    did,
    provider: "did:ethr",
    alias: `${subjectName}-did-ethr`,
    keys: [
      {
        privateKeyHex: ethPrivateKey,
        kms: "local",
        type: "Secp256k1",
        kid: `${subjectName}-controller-key`,
      },
    ],
  });
}
