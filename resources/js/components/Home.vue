<template>
	<div>
		<div class="column is-half is-offset-one-quarter">
			<message :message="error"></message>
		</div>

		<div
			class="file is-centered has-name is-boxed"
			:class="{ 'is-danger' : error.length }">
			<label class="file-label">
				<input class="file-input" type="file" name="excel_file" ref="file" v-on:change="handleFileUpload()">
				<span class="file-cta">
					<span class="file-icon">
						<i class="fas fa-upload"></i>
					</span>
					<span class="file-label">
						Votre fichier excel
					</span>
				</span>
				<span class="file-name" v-if="file.name">
					{{ file.name }}
				</span>
			</label>
		</div>

		<div class="buttons is-centered" v-if="file.name.length">
			<a class="button is-primary is-outlined" @click="reset()">
				<span>Réinitialiser</span>
				<span class="icon is-small">
					<i class="fas fa-sync"></i>
				</span>
			</a>
			<download-csv
				v-if="excelData.length"
				class="button is-primary"
				:labels="labels"
				:data="csvData"
				:name="csvName">
				<span>Télécharger</span>
				<span class="icon is-small">
					<i class="fas fa-file-download"></i>
				</span>
			</download-csv>
		</div>

		<home-table :data="excelData" v-if="excelData.length"></home-table>
	</div>
</template>

<script>
import axios from 'axios';
import Message from './Message';
import HomeTable from './HomeTable';
import cloneDeep from 'lodash/cloneDeep';

export default {
	components: {
		Message,
		HomeTable,
	},

	data: () => {
		return {
			file: {
				name: '',
				file: ''
			},
			excelData: [],
			labels: {
				word: 'Libellé',
				business: 'Entreprise',
				category: 'Catégorie',
				team: 'Equipe',
				transacType: 'Type',
				ttcAmount: 'Montant TTC',
				htAmount: 'Montant HT',
				tvaRate: 'Taux TVA',
				ventilation: 'Ventilation',
				relatifStart: 'Début relatif (mois)',
				relatifEnd: 'Fin relatif (mois)'
			},
			error: '',
		};
	},

	computed: {
		csvName() {
			return `${this.file.name}.csv`;
		},
		csvData() {
			const csvData = cloneDeep(this.excelData);
			const array = csvData.map( (item) => {
				delete item.id;
				delete item.hasModel;
				item.htAmount = this.getHtAmount(item.ttcAmount, item.tvaRate);
				return item;
			});
			return array;
		},
	},

	methods: {
		handleFileUpload () {
			this.file.name = this.$refs.file.files[0].name;
			this.file.file = this.$refs.file.files[0];

			let formData = new FormData();
			formData.append('excel_file', this.file.file)

      axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then( (response) => {
				this.excelData = response.data;
				this.error = '';
      }).catch( (err) => {
				this.error = err.response.data.error;
				this.excelData = [];
      });
		},

		reset () {
			this.file = {
				name: '',
				file: ''
			};
			this.error = '';
			this.excelData = [];
		},

		getHtAmount (amount, tvaRate) {
			const math = amount / (1 + (tvaRate / 100));

			return Number(Math.round(math+'e2')+'e-2');
		},
	}
}
</script>

<style>
.buttons {
	margin-top: 2rem;
	margin-bottom: 1rem;
}
</style>
