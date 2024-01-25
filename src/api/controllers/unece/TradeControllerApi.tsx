import {TradeControllerApi} from "@unece/cotton-fetch";
import configuration from "./utils";

const tradeControllerApi = new TradeControllerApi(configuration);

export default tradeControllerApi;