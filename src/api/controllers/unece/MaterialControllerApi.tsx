import configuration from "./utils";
import {MaterialControllerApi} from "@unece/cotton-fetch";

const materialControllerApi = new MaterialControllerApi(configuration);

export default materialControllerApi;