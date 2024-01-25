import {UserControllerApi} from "@unece/cotton-fetch";
import configuration from "./utils";

const userControllerApi = new UserControllerApi(configuration);

export default userControllerApi;