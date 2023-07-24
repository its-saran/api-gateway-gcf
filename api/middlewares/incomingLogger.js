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
    console.log(`Host: ${req.get('host')}`)
    console.log(`Request url: ${req.url}`)
    const endpoint = Object.keys(config.Endpoints).find(key => req.url.includes(key));

    if (endpoint) {
        const endpointData = config.Endpoints[endpoint];
        req.log.gatewayReq.serviceType  = endpointData.serviceType;
        req.log.gatewayReq.service  = endpointData.service;
        req.log.gatewayReq.apiType = endpointData.apiType;
        req.log.gatewayReq.apiRoute = endpointData.apiRoute;
        idSuffix = endpointData.idSuffix;
    }
    
    req.log.service.name = config.serviceName
    req.log.id = utils.timeId() + idSuffix
    req.log.path = `Logs/${utils.capitalizeString(req.log.gatewayReq.service)}/${utils.capitalizeString(req.log.gatewayReq.apiType)}Logs`
    
    const requestLog = `Request | Reference ID: ${req.log.id} | Method: ${req.method} | URL: ${req.originalUrl} | IP: ${req.ip} `
    utils.reqResMessage(serviceName, requestLog, req.log.console)

    await firestoreDb.createDoc(req.log.path, req.log.id, req.log)
    next();
};
  
export default incomingLogger;




