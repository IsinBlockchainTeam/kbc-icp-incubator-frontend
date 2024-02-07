import { VerifiablePresentation } from "@veramo/core";
import { agent } from "./setup";

export default class PresentationService {
  private _agent;
  private _receivedPresentations: Map<string, unknown>;

  constructor() {
    this._agent = agent;
    this._receivedPresentations = new Map<string, unknown>();
  }

  public savePresentation(challengeId: string, presentation: unknown): void {
    this._receivedPresentations.set(challengeId, presentation);
  }

  public getPresentation(challengeId: string): unknown {
    return this._receivedPresentations.get(challengeId);
  }

  public async createSelectiveDisclosureRequest(
    issuerDid: string,
    tag: string,
    claimType: string,
    reason: string
  ): Promise<string> {
    return this._agent.createSelectiveDisclosureRequest({
      data: {
        issuer: issuerDid,
        tag,
        claims: [
          {
            reason,
            claimType,
            essential: true,
          },
        ],
      },
    });
  }

  public async validatePresentation(
    verifiablePresentation: VerifiablePresentation,
    issuerDid: string,
    claimType: string
  ) {
    return this._agent.validatePresentation({
      presentation: verifiablePresentation,
      sdr: {
        issuer: issuerDid,
        claims: [
          {
            claimType,
          },
        ],
      },
    });
  }
}
