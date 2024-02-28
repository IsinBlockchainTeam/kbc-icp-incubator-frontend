import {
  IIdentifier,
  MinimalImportableIdentifier,
  TKeyType,
} from "@veramo/core";
import { agent } from "./setup";
import { ImportableIdentifierBuilder } from "../../builder/ImportableIdentifierBuilder";
import configuration from "../../api/controllers/unece/utils";
import { requestPath } from "../../constants";

export default class DidService {
  private _agent;

  constructor() {
    this._agent = agent;
  }

  public async getKeys(did: string) {
    const kms = await this._agent.keyManagerGetKeyManagementSystems();
    console.log(kms);
  }

  public async resolveDid(didUrl: string) {
    return this._agent.resolveDid({ didUrl });
  }

  public async getIdentifiers() {
    return this._agent.didManagerFind();
  }

  public async createDid(): Promise<IIdentifier> {
    return this._agent.didManagerCreate();
  }

  private async importIdentifierIntoDidManager(
    identifier: MinimalImportableIdentifier
  ) {
    return this._agent.didManagerImport(identifier);
  }

  public async importIdentifier(
    did: string,
    ethPrivateKey: string,
    subjectName: string
  ) {
    const didResolutionResult = await this.resolveDid(did);
    const { didDocument } = didResolutionResult;
    if (!didDocument) throw new Error("DID not found");

    const importableIdentifier = ImportableIdentifierBuilder.build(
      didDocument.id,
      ethPrivateKey,
      subjectName
    );
    importableIdentifier.services = didDocument.service;
    return this.importIdentifierIntoDidManager(importableIdentifier);
  }

  private async createEncyptionKey(did: string, kms: string, type: TKeyType) {
    const newKey = await this._agent.keyManagerCreate({
      kms,
      type,
    });

    return this._agent.didManagerAddKey({
      did: did,
      key: newKey,
    });
  }

  public async addDidCommService(did: string) {
    const identifiers = await this.getIdentifiers();
    if (!identifiers.find((i: IIdentifier) => i.did === did)) {
      throw new Error("Error, DID not imported.");
    }
    return this._agent.didManagerAddService({
      did: did,
      service: {
        id: 'didcomm-endpoint-' + did,
        type: 'DIDCommMessaging',
        serviceEndpoint: `${requestPath.VERAMO_PROXY_URL}/api/services/verifier`,
        description: 'handles DIDComm messages',
      },
    });
  }

  public async addX25519DidKey(did: string) {
    const identifiers = await this.getIdentifiers();
    if (!identifiers.find((i: IIdentifier) => i.did === did)) {
      throw new Error("Error, DID not imported.");
    }
    return this.createEncyptionKey(did, "local", "X25519");
  }
}
