import utils from '../utils/helper.js'
import { firestoreDb } from '../utils/firebase.js';

const incomingLogger = (config) => async (req, res, next) => {
    req.log = {
        startTime: Date.now(),
        gatewayReq: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            time: utils.time(),
            userAgent: req.headers['user-agent'],
            service: 'unknown',
            apiType: 'unknown',
            serviceType: 'unknown',
            apiRoute: 'unknown'
        },
    }
    req.log.console = {}
    req.log.service = {}
    req.log.gatewayRes = {}
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
        idSuffix = endpointData.idSuffix;
    }

    const method = req.method
    const originalUrl = req.originalUrl
    const clientIp = req.ip

    const service = req.log.gatewayReq.service
    const apiType = req.log.gatewayReq.apiType
    const logId = utils.timeId() + idSuffix
    const logPath = `Logs/${utils.capitalizeString(service)}/${utils.capitalizeString(apiType)}Logs`

    const serviceQuery = `${originalUrl}`.replace(`${service}/`, '').replace(/&?apikey=[^&]*/g, '')
    const logQuery = `&logId=${logId}&logPath=${logPath}`
    const proxyUrl = target+service+serviceQuery+logQuery

    const requestLog = `Request | Reference ID: ${logId} | Method: ${method} | URL: ${originalUrl} | IP: ${clientIp} `
    utils.reqResMessage(serviceName, requestLog, req.log.console)

    const logMessage = (message) => utils.logMessage(serviceName, logId, message, req.log.console);
    logMessage(`Forwarded url: ${proxyUrl}`)

    req.log.id = logId
    req.log.proxyUrl = proxyUrl
    await firestoreDb.createDoc(logPath, logId, req.log)

    next();
};
  
export default incomingLogger;




