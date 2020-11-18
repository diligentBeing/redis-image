import axios from "axios";

function isRequestByServer() {
  return typeof window === "undefined";
}

const buildClient = ({ req }) => {
  if (isRequestByServer()) {
    const serviceName = "ingress-nginx-controller";
    const namespace = "ingress-nginx";
    const linkPrefix = `http://${serviceName}.${namespace}.svc.cluster.local`;
    console.log(`Link prefix is ${linkPrefix}`);
    return axios.create({ baseURL: `${linkPrefix}`, headers: req.headers });
  }

  console.log("Link prefix is /");

  return axios.create({
    baseURL: "/",
  });
};

export default buildClient;
