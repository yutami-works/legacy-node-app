const qs = require('qs');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const HttpsProxyAgent = require('https-proxy-agent');

const proxyAgent = new HttpsProxyAgent(process.env.HTTPS);

const getGraphToken = async () => {
  const url = `${process.env.OAUTH_BASE_EP}/${process.env.TENANT_ID}/oauth2/v2.0/token`;
  const reqBody = {
    client_id: process.env.CLIENT_ID,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: process.env.CLIENT_SECRET,
    grant_type: 'client_credentials'
  };
  const data = qs.stringify(reqBody);
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    httpsAgent: proxyAgent,
    proxy: false,
    timeout: 3000
  };
  return await axios.post(url, data, config);
}

const createGraphInstance = (accessToken) => {
  // create instance
  const instanceConfig = {
    baseURL: process.env.GRAPH_BASE_EP,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    httpsAgent: proxyAgent,
    proxy: false,  // user httpsAgent
    timeout: 30000 // think about retry
, };
  const instance = axios.create(instanceConfig);

  // setting retry
  const retryConfig = {
    retries: 12,
    retryCondition: () => true,
    retryDelay: (retryCount, error) => {
      return 1000;
    }
  };
  // add retry to instance
  axiosRetry(instance, retryConfig);
  return instance;
}

const getGraph = async (accessToken, url) => {
  const axiosInstance = createGraphInstance(accessToken);
  return await axiosInstance.get(url);
}

const postGraph = async (accessToken, url, data) => {
  const axiosInstance = createGraphInstance(accessToken);
  return await axiosInstance.post(url, data);
}

const patchGraph = async (accessToken, url, data) => {
  const axiosInstance = createGraphInstance(accessToken);
  return await axiosInstance.patch(url, data);
}

module.exports = {
  getGraphToken,
  createGraphInstance,
  getGraph,
  postGraph,
  patchGraph
};