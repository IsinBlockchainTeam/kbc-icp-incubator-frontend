import {
  IPackedDIDCommMessage,
  IDIDCommMessage,
  IUnpackedDIDCommMessage,
} from "@veramo/did-comm";
import MessageService from "./MessageService";
import PresentationService from "./PresentationService";
import { IIdentifier, IMessage, VerifiablePresentation } from "@veramo/core";
import { EncryptedDidCommMessageQRcode } from "../../types/EncryptedDidCommMessageQRcode";
import DidService from "./DidService";

export default class VeramoService {
  private _didService: DidService;
  private _presentationService: PresentationService;
  private _messageService: MessageService;

  constructor() {
    this._didService = new DidService();
    this._presentationService = new PresentationService();
    this._messageService = new MessageService();
  }

  public async getKeys(did: string) {
    return this;
  }

  public async importIdentifier(
    did: string,
    ethPrivateKey: string,
    subjectName: string
  ) {
    return this._didService.importIdentifier(did, ethPrivateKey, subjectName);
  }

  public async createDid(): Promise<IIdentifier> {
    return this._didService.createDid();
  }

  public async addX25519DidKey(did: string) {
    return this._didService.addX25519DidKey(did);
  }

  public async addDidCommServiceaddService(did: string) {
    return this._didService.addDidCommService(did);
  }

  public async handleMessage(str: string): Promise<IMessage> {
    return this._messageService.handleMessage(str);
  }

  public async sendAsyncMessage(
    recipientDid: string,
    packedMessage: IPackedDIDCommMessage
  ): Promise<string> {
    return this._messageService.sendDidCommMessage({
      messageId: "test-message-id",
      packedMessage,
      recipientDidUrl: recipientDid,
    });
  }

  public async sendAsyncEncryptedMessage(
    recipientDid: string,
    message: IDIDCommMessage
  ): Promise<string> {
    return this._messageService.sendEncryptedDidCommMessage(
      message,
      recipientDid
    );
  }

  public async unpackDIDCommMessage(
    args: any
  ): Promise<IUnpackedDIDCommMessage> {
    return this._messageService.unpackDidCommMessage(args);
  }

  public savePresentation(challengeId: string, presentation: unknown): void {
    this._presentationService.savePresentation(challengeId, presentation);
  }

  public getPresentation(challengeId: string): unknown {
    return this._presentationService.getPresentation(challengeId);
  }

  public async createSelectiveDisclosureRequest(
    issuerDid: string,
    tag: string,
    claimType: string,
    reason: string
  ): Promise<string> {
    return this._presentationService.createSelectiveDisclosureRequest(
      issuerDid,
      tag,
      claimType,
      reason
    );
  }

  public async validatePresentation(
    verifiablePresentation: VerifiablePresentation,
    issuerDid: string,
    claimType: string
  ) {
    return this._presentationService.validatePresentation(
      verifiablePresentation,
      issuerDid,
      claimType
    );
  }

  public async generateQRcodeForPresentationRequest(
    type: string,
    issuerDid: string,
    uid: string,
    jwt: string
  ) {
    const message = {
      type,
      from: issuerDid,
      to: "",
      id: uid,
      body: jwt,
    };
    return this._messageService.generateQRcodeForEncryptedDidCommMessage(
      message
    );
  }
}
