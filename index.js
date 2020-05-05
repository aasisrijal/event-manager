const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } =  require('graphql');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const graphSchema = require('./graphql/schema/index');
const graphResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/isAuth');

dotenv.config();



const app = express();
app.use(bodyParser.json());

// for cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);


//connect to db
mongoose.connect( process.env.MONGO_DB,
	{useNewUrlParser: true,
		useUnifiedTopology: true},
	 () => {
	console.log('connected to mongo atlas')
});

app.use(
  '/graphql',
  graphqlHttp({
    schema: graphSchema,
    rootValue: graphResolvers ,
    graphiql: true
  })
);

const port = 5000;
app.listen(port, ()=> console.log(`server is running in ${port}`));