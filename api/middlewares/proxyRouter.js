import axios from 'axios';
import utils from '../utils/helper.js'

const proxyRouter = async (req, res, next) => {

    const proxyUrl = req.log.proxyUrl
    axios.get(proxyUrl)
      .then(response => {
            res.send(response.data)
      })
      .catch(error => {
            console.log(error)
            const err = utils.createError({status: 500});
            res.status(err.error.status).json(err);
      });
};

export default proxyRouter;


