import axios from 'axios';
import utils from '../utils/helper.js'

const proxyRouter = async (req, res, next) => {

    const proxyUrl = req.log.proxyUrl
    axios.get(proxyUrl)
      .then(response => {
            res.send(response.data)
            console.log('Response sent')
      })
      .catch(error => {
            console.log(error)
            console.log(`Error: ${error.message}`);
            const err = utils.createError({status: 500, details: "Internal server error"});
            res.status(err.error.status).json(err);
      });
};

export default proxyRouter;


