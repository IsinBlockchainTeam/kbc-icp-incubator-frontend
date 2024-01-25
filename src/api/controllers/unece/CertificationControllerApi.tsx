import {CertificationControllerApi} from "@unece/cotton-fetch";
import configuration from "./utils";

const certificationControllerApi = new CertificationControllerApi(configuration);

export default certificationControllerApi;