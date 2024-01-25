import {ProcessTypeControllerApi} from "@unece/cotton-fetch";
import configuration from "./utils";

const processTypeControllerApi = new ProcessTypeControllerApi(configuration);

export default processTypeControllerApi;