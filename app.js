const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const expressEdge = require('express-edge');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const app = express();

// Load Packages
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: true,
}));
app.use(compression());
app.use(fileUpload());
app.use(expressEdge);
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

// Database
const adapter = new FileSync(path.join(__dirname, 'db.json'));
const db = low(adapter);

// Route
app.get('/', (req, res) => {
	res.render('home', { message: 'Hello World' });
});

app.post('/upload', async function (req, res) {
	if (req.files.excel_file) {
		if (req.files.excel_file.mimetype === 'application/vnd.ms-excel') {
			const workbook = XLSX.read(req.files.excel_file.data, { type:'buffer' });
			const getSheet = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[getSheet];
			const jsonSheet = XLSX.utils.sheet_to_json(worksheet);

			let results = [];

			for (let i = 0; i < jsonSheet.length; i++) {
				const model = await db.get('models').find({ word: jsonSheet[i].Description }).value();

				const myObject = {
					id: i,
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
	const models = await db.get('models').value()

	return res.status(200).send(models);
});

app.get('/models', function (req, res) {
	res.render('models');
});

app.post('/rows', function (req, res) {
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

	const model = db.get('models').find({ word: req.body.word }).value();

	if (model) {
		db.get('models')
			.find({ word: req.body.word })
			.assign(object)
			.write()

		return res.send(200).send();
	} else {
		db.get('models')
			.push(object)
			.write()

		return res.send(201).send();
	}
});

app.delete('/rows/:word', async function (req, res) {
	const model = await db.get('models').find({ word: req.params.word }).value();

	if (model) {
		await db.get('models').remove({ word: req.params.word }).write();

		return res.status(204).send();
	}

	return res.status(401).send();
});

app.listen(4000, () => {
  console.log('Marieke Special App running on port 4000!')
});
