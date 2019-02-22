<template>
	<div>
		<div class="column is-half is-offset-one-quarter">
			<message :message="error"></message>
		</div>
		<table class="table is-bordered is-fullwidth is-hoverable" v-if="data.length">
			<thead>
				<tr>
					<th>Libellé</th>
					<th>Société</th>
					<th>Catégorie</th>
					<th>Equipe</th>
					<th>Type</th>
					<th>Taux TVA</th>
					<th>Ventilation</th>
					<th>Début relatif (mois)</th>
					<th>Fin relatif (mois)</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="r in data" :key="r.id">
					<td>{{ r.word }}</td>
					<td>{{ r.business }}</td>
					<td>{{ r.category }}</td>
					<td>{{ r.team }}</td>
					<td>{{ r.transac_type }}</td>
					<td>{{ r.tva_rate }}</td>
					<td>{{ r.ventilation }}</td>
					<td>{{ r.relatif_start }}</td>
					<td>{{ r.relatif_end }}</td>
					<td class="table-icon-delete">
						<a @click="destroy(r.word)"><i class="fas fa-trash-alt"></i></a>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="container" v-else>
			<article class="message is-warning">
				<div class="message-body">
					Vous n'avez aucun modèles.
				</div>
			</article>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import Message from './Message.vue'

export default {
	components: {
		Message
	},

	data() {
		return {
			data: [],
			error: ''
		};
	},

	methods: {
		destroy (word) {
			axios.delete(`/rows/${word}`)
				.then( (response) => {
				const row = this.data.findIndex(x => x.word === word);
				this.data.splice(row, 1);
      }).catch( (err) => {
				this.error = err.response.data.error;
      });
		},
	},

	created () {
		axios.get('/rows')
			.then( (response) => {
				this.data = response.data;
			}).catch( (err) => {
				this.error = err.response.data.error;
			});
	}
};
</script>

<style scoped>
.table-icon-delete {
	text-align: center;
	vertical-align: middle !important;
}
.table-icon-delete > a {
	color: hsl(348, 100%, 61%);
}
</style>
