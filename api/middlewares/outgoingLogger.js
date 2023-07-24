import utils from '../utils/helper.js';
import { firestoreDb } from '../utils/firebase.js';

const outgoingLogger = (config) => async (req, res, next) => {

    const serviceName = config.serviceName;
    const logId = req.log.id;
    const logPath = req.log.path

    res.on('finish', async () => {

        await utils.waitFor(50)
        let log = await firestoreDb.getDoc(logPath, logId)
        const errorMessage = (message) => utils.errorMessage(log.id, message, log.console);

        const endTimestamp = Date.now();
        log.totalTime = ((endTimestamp - req.startTimestamp) / 1000).toFixed(2); // Convert to seconds
        log.gatewayRes.memoryUsage = (process.memoryUsage().rss / (1024 * 1024)).toFixed(2); // Get memory usage in megabytes with 2 decimal places
        log.gatewayRes.statusCode = res.statusCode
        log.gatewayRes.contentLength = parseInt(res.get('Content-Length') || 0, 10);

        const responseLog = `Response | ${log.id} | Status code: ${log.gatewayRes.statusCode} | Total Time: ${log.totalTime}s | Content Length: ${log.gatewayRes.contentLength} Bytes`;
        utils.reqResMessage(serviceName, responseLog, log.console);

        try {
            await firestoreDb.createDoc(log.path, log.id, log)
        } 
        catch (error) {
            errorMessage(`Error creating log`)
        }
    });
    
    next();
};

export default outgoingLogger;







