import utils from '../utils/helper.js';
import { firestoreDb } from '../utils/firebase.js';

const outgoingLogger = (config) => async (req, res, next) => {

    const serviceName = config.serviceName
    const logId = req.log.id
    const logPath = req.log.path

    res.on('finish', async () => {

        await utils.waitFor(50)
        let log = await firestoreDb.getDoc(logPath, logId)
        const errorMessage = (message) => utils.errorMessage(logId, message, log.console);

        const endTimestamp = Date.now();
        const totalTime = ((endTimestamp - req.log.startTime) / 1000).toFixed(2); // Convert to seconds
        const memoryUsage =(process.memoryUsage().rss / (1024 * 1024)).toFixed(2); // Get memory usage in megabytes with 2 decimal places
        const statusCode = res.statusCode
        const contentLength = parseInt(res.get('Content-Length') || 0, 10);

        const responseLog = `Response | ${logId} | Status code: ${statusCode} | Total Time: ${totalTime}s | Content Length: ${contentLength} Bytes`;
        utils.reqResMessage(serviceName, responseLog, log.console);

        log.totalTime = totalTime
        log.gatewayRes.memoryUsage = memoryUsage
        log.gatewayRes.statusCode = statusCode
        log.gatewayRes.contentLength = contentLength

        try {
            await firestoreDb.createDoc(logPath, logId, log)
        } 
        catch (error) {
            errorMessage(`Error creating log`)
        }
    });
    
    next();
};

export default outgoingLogger;







