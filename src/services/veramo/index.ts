import { IPackedDIDCommMessage, IDIDCommMessage } from "@veramo/did-comm";
import MessageService from "./MessageService";
import PresentationService from "./PresentationService";
import { IMessage, VerifiablePresentation } from "@veramo/core";

export default class VeramoService {
  private _presentationService: PresentationService;
  private _messageService: MessageService;

  constructor() {
    this._presentationService = new PresentationService();
    this._messageService = new MessageService();
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
}
