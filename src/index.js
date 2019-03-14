const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const Sequelize = require('sequelize');
const basicAuth = require('express-basic-auth')
const cors = require('cors');

const app = express();

// Instantiate Modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: true,
}));
app.use(compression());
app.use(cors());
app.use(fileUpload());
app.use(basicAuth({
	users: { 'admin': process.env.ADMIN_PASS || 'admin' }
}))

// File Config
const availableExtension = [
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Database config
const database = {
	host: process.env.DB_HOST || 'localhost',
	name: process.env.DB_NAME || 'marieke',
	user: process.env.DB_USER || 'clement',
	password: process.env.DB_PASS || 'postgres',
};

const serverPort = process.env.PORT || 4000;

// Database
const sequelize = new Sequelize(database.name, database.user, database.password, {
  host: database.host,
  dialect: 'postgres',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Models
const Row = sequelize.define('row', {
  word: {
    type: Sequelize.STRING
  },
  business: {
    type: Sequelize.STRING
	},
  category: {
    type: Sequelize.STRING
	},
  team: {
    type: Sequelize.STRING
	},
	transac_type: {
		type: Sequelize.STRING
	},
	tva_rate: {
		type: Sequelize.INTEGER
	},
	ventilation: {
		type: Sequelize.INTEGER
	},
	relatif_start: {
		type: Sequelize.INTEGER
	},
	relatif_end: {
		type: Sequelize.INTEGER
	},
});

Row.sync({ force: false });

// Route
app.get('/', (req, res) => {
	res.json({ message: 'Hello World!' });
});

app.post('/upload', async function (req, res) {
	if (req.files.excel_file) {
		if (availableExtension.includes(req.files.excel_file.mimetype)) {
			const workbook = XLSX.read(req.files.excel_file.data, { type:'buffer' });
			const getSheet = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[getSheet];
			const jsonSheet = XLSX.utils.sheet_to_json(worksheet);

			let results = [];

			for (let i = 0; i < jsonSheet.length; i++) {
				const model = await Row.findOne({ where: { word: jsonSheet[i].Description } });

				const myObject = {
					id: i,
					date: jsonSheet[i].Date,
					word: jsonSheet[i].Description,
					business: model ? model.business : null,
					category: model ? model.category : null,
					team: model ? model.team : null,
					transacType: model ? model.transac_type : null,
					ttcAmount: jsonSheet[i].Montant,
					htAmount: null,
					tvaRate: model ? model.tva_rate : null,
					ventilation: model ? model.ventilation : null,
					relatifStart: model ? model.relatif_start : null,
					relatifEnd: model ? model.relatif_end : null,
					hasModel: model ? true : false
				};

				results.push(myObject);
			}

			return res.status(200).send(results);
		}

		return res.status(400).send({ error : 'File type is not supported.' })
	}

	return res.status(400).send({ error: 'No files were uploaded.' });
});

app.get('/rows', async function (req, res) {
	const models = await Row.findAll({
		order: [
			['createdAt', 'DESC']
		]
	});

	return res.status(200).send(models);
});

app.post('/rows', async function (req, res) {
	const object = {
		word: req.body.word,
		business: req.body.business,
		category: req.body.category,
		team: req.body.team,
		transac_type: req.body.transacType,
		tva_rate: req.body.tvaRate,
		ventilation: req.body.ventilation,
		relatif_start: req.body.relatifStart,
		relatif_end: req.body.relatifEnd
	};

	const model = await Row.findOne({ where: { word: req.body.word } });

	if (model) {
		await Row.update(object);

		return res.send(200).send();
	} else {
		await Row.create(object);

		return res.send(201).send();
	}
});

app.delete('/rows/:word', async function (req, res) {
	const model = await Row.findOne({ where: { word: req.params.word } });

	if (model) {
		await model.destroy();

		return res.status(204).send();
	}

	return res.status(401).send();
});


app.listen(serverPort, () => {
  console.log(`Application is running on port: ${serverPort}`);
});
