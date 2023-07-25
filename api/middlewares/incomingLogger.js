import utils from '../utils/helper.js'
import { firestoreDb } from '../utils/firebase.js';

const incomingLogger = (config) => async (req, res, next) => {

    const method = req.method
    const originalUrl = req.originalUrl
    const clientIp = req.ip
    const userAgent = req.headers['user-agent']
    const startTime = Date.now()
    const indianTime = utils.time()

    req.log = {
        startTime,
        gatewayReq: {
            method,
            url: originalUrl,
            ip: clientIp,
            time: indianTime,
            userAgent,
            service: 'unknown',
            apiType: 'unknown',
            serviceType: 'unknown',
            apiRoute: 'unknown'
        },
        service: {},
        gatewayRes: {},
        console: {},
    }

    let idSuffix = '-UNK'

    const serviceName = config.serviceName
    const target = config.target
    const endpoint = Object.keys(config.Endpoints).find(key => req.url.includes(key));

    if (endpoint) {
        const endpointData = config.Endpoints[endpoint];
        req.log.gatewayReq.serviceType  = endpointData.serviceType;
        req.log.gatewayReq.service  = endpointData.service;
        req.log.gatewayReq.apiType = endpointData.apiType;
        req.log.gatewayReq.apiRoute = endpointData.apiRoute;
        req.log.gatewayReq.version = endpointData.version;
        idSuffix = endpointData.idSuffix;
    }

    const service = req.log.gatewayReq.service
    const apiType = req.log.gatewayReq.apiType
    const apiRoute = req.log.gatewayReq.apiRoute
    const version =  req.log.gatewayReq.version

    const logId = utils.timeId() + idSuffix
    const logPath = `Logs/${utils.capitalizeString(service)}/${utils.capitalizeString(apiType)}Logs`
    const logQuery = `&logId=${logId}&logPath=${logPath}`

    let splitUrl =  originalUrl.split(`/${service}`).join("")
    splitUrl = splitUrl.split(`/${version}`).join("")
    const proxyUrl = target + service + `/${apiRoute}`+ splitUrl

    const url = new URL(proxyUrl);
    url.searchParams.delete('apikey');
    const finalProxyUrl = url.toString() + logQuery

    const requestLog = `Request | Reference ID: ${logId} | Method: ${method} | URL: ${originalUrl} | IP: ${clientIp} `
    utils.reqResMessage(serviceName, requestLog, req.log.console)

    const logMessage = (message) => utils.logMessage(serviceName, logId, message, req.log.console);
    logMessage(`Forwarded url: ${finalProxyUrl}`)

    req.log.id = logId
    req.log.path = logPath
    req.log.proxyUrl = finalProxyUrl
    await firestoreDb.createDoc(logPath, logId, req.log)

    next();
};
  
export default incomingLogger;





