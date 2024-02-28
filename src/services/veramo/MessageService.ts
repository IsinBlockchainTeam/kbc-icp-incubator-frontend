import {
  IDIDCommMessage,
  IPackDIDCommMessageArgs,
  IPackedDIDCommMessage,
  IUnpackedDIDCommMessage,
} from "@veramo/did-comm";
import { agent } from "./setup";
import { ISendDIDCommMessageArgs } from "@veramo/did-comm/build/didcomm";
import { IMessage } from "@veramo/core";
import { request } from "../../utils/request";
import { requestPath } from "../../constants";
import { EncryptedDidCommMessageQRcode } from "../../types/EncryptedDidCommMessageQRcode";

export default class MessageService {
  private _agent;

  constructor() {
    this._agent = agent;
  }

  public async handleMessage(str: string): Promise<IMessage> {
    return this._agent.handleMessage({
      raw: str,
      save: true,
    });
  }

  public async sendDidCommMessage(
    args: ISendDIDCommMessageArgs
  ): Promise<string> {
    return this._agent.sendDIDCommMessage(args);
  }

  private async packDidCommMessage(
    args: IPackDIDCommMessageArgs
  ): Promise<IPackedDIDCommMessage> {
    return this._agent.packDIDCommMessage(args);
  }

  public async unpackDidCommMessage(
    args: any
  ): Promise<IUnpackedDIDCommMessage> {
    return this._agent.unpackDIDCommMessage(args);
  }

  private async encryptDidCommMessage(
    message: IDIDCommMessage,
    encrypted: boolean = true
  ): Promise<IPackedDIDCommMessage> {
    return this.packDidCommMessage({
      packing: encrypted ? "anoncrypt" : "none",
      message,
    });
  }

  public async sendEncryptedDidCommMessage(
    message: IDIDCommMessage,
    recipientDidUrl: string
  ): Promise<string> {
    const packedMessage = await this.encryptDidCommMessage(message);
    return this.sendDidCommMessage({
      messageId: "test-message-id",
      packedMessage,
      recipientDidUrl,
    });
  }

  public async generateQRcodeForEncryptedDidCommMessage(
    message: IDIDCommMessage
  ): Promise<EncryptedDidCommMessageQRcode> {
    const encrypted = message.type !== "presentation-request-auth";
    const packedMessage = await this.encryptDidCommMessage(message, encrypted);

    const shortenUrl = await request(
      `${requestPath.VERAMO_PROXY_URL}/api/shorten-url`,
      { method: "POST", body: JSON.stringify(packedMessage) }
    );
    return {
      qrcode: shortenUrl,
      offer: message,
    };
  }
}
