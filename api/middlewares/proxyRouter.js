import axios from 'axios';

const proxyMiddleware = (req, res, next) => {

    const target = `https://asia-south1-whrilapi.cloudfunctions.net/`
    const service = req.log.gatewayReq.service
    const serviceQuery = `${req.originalUrl}`.replace(`${req.log.gatewayReq.service}/`, '').replace(/&?apikey=[^&]*/g, '')
    const logQuery = `&logId=${req.log.id}&logPath=${req.log.path}`
    const finalUrl = target+service+serviceQuery+logQuery
    console.log(`Final proxy url: ${finalUrl}`)

    axios.get(finalUrl)
      .then(response => {
          console.log('Response sent')
          res.send({
            data: req.testData,
            responseData: response.data
        })
      })
      .catch(error => {
          console.error('Error:', error.message);
          res.send(error.message)
      });
};

export default proxyMiddleware;

