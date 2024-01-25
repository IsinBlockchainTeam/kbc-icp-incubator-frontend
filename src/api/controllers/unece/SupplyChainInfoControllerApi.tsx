import {SupplyChainInfoControllerApi} from "@unece/cotton-fetch";
import configuration from "./utils";

const processControllerApi = new SupplyChainInfoControllerApi(configuration);

export default processControllerApi;