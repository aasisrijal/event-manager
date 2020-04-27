const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		req.isAuth = false;
		return next();
	}
	const token = authHeader.split(' ')[1];

	if (!token || token ==='') {
		req.isAuth = false;
		return next();
	}
	try {
		decodedTok = jwt.verify(token, process.env.SECRET_KEY);
	} catch (err) {
		req.isAuth = false;
		return next();
	}
	if (!decodedTok) {
		req.isAuth = false;
		return next();
	}
	req.isAuth = true;
	req.userId = decodedTok.userId;
	next();
	
}