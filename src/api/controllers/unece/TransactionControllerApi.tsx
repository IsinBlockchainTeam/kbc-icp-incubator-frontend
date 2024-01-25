import {TransactionControllerApi} from "@unece/cotton-fetch";
import configuration from "./utils";

const transactionControllerApi = new TransactionControllerApi(configuration);

export default transactionControllerApi;