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

const port = 3000
app.listen(port, ()=> console.log(`server is running in ${port}`));