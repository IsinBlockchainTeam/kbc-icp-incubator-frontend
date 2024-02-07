import {
  IDIDCommMessage,
  IPackDIDCommMessageArgs,
  IPackedDIDCommMessage,
} from "@veramo/did-comm";
import { agent } from "./setup";
import { ISendDIDCommMessageArgs } from "@veramo/did-comm/build/didcomm";
import { IMessage } from "@veramo/core";

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

  private async encryptDidCommMessage(
    message: IDIDCommMessage,
    encrypted: boolean = true
  ): Promise<IPackedDIDCommMessage> {
    return this.packDidCommMessage({
      packing: "anoncrypt",
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
}
