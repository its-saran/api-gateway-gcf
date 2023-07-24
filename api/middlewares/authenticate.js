import utils from '../utils/helper.js';
import { firestoreDb } from '../utils/firebase.js';

const authenticator = async(req, res, next) => {
    const apiKey = req.query.apikey;
    const apikeys = await firestoreDb.getDocIds('Keys')

    if (!apiKey || !apikeys.includes(apiKey)) {
        const err = utils.createError({ status: 401 });
        res.status(err.error.status).json(err);
        req.log.gatewayReq.status = err.error.message
        await firestoreDb.createDoc(req.log.path, req.log.id, req.log)
    } else {
        req.log.gatewayReq.status = "success";
        await firestoreDb.createDoc(req.log.path, req.log.id, req.log)
        next();
    }
};
  
export default authenticator




  