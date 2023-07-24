import axios from 'axios';
import utils from '../utils/helper.js'

const proxyRouter = (target) => async (req, res, next) => {

    let log = req.log
    const logMessage = (message) => utils.logMessage(log.service.name, log.id, message, log.console);
    const errorMessage = (message) => utils.errorMessage(log.service.name, log.id, message, log.console);

    const service = log.gatewayReq.service
    const serviceQuery = `${req.originalUrl}`.replace(`${service}/`, '').replace(/&?apikey=[^&]*/g, '')
    const logQuery = `&logId=${log.id}&logPath=${log.path}`
    const finalUrl = target+service+serviceQuery+logQuery
    logMessage(`Forwarded url: ${finalUrl}`)

    axios.get(finalUrl)
      .then(response => {
          res.send(response.data)
          logMessage('Response sent')
      })
      .catch(error => {
          errorMessage(`Error: ${error.message}`);
          const err = utils.createError({status: 500, details: "Internal server error"});
          res.status(err.error.status).json(err);
      });
    req.log = log
};

export default proxyRouter;

