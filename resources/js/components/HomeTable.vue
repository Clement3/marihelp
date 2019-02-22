<template>
	<table class="table is-bordered is-fullwidth is-hoverable">
  	<thead>
			<tr>
				<th>Libellé</th>
				<th>Société</th>
				<th>Catégorie</th>
				<th>Equipe</th>
				<th>Type</th>
				<th>Montant TTC / HT</th>
				<th>Taux TVA</th>
				<th>Ventilation</th>
				<th>Début relatif (mois)</th>
				<th>Fin relatif (mois)</th>
				<th>Action</th>
			</tr>
  	</thead>
  	<tbody>
			<tr v-for="r in data" :key="r.id" :class="{ 'row-has-model' : r.hasModel }">
				<td>{{ r.word }}</td>
				<td>
					<div class="field">
						<p class="control">
							<input class="input is-small" type="text" v-model="r.business">
						</p>
					</div>
				</td>
				<td>
					<div class="select is-small">
						<select v-model="r.category">
							<option disabled selected>Catégorie</option>
							<option :value="value" v-for="(value, key) in categories" :key="key">{{ value }}</option>
						</select>
					</div>
				</td>
				<td>
					<div class="select is-small">
						<select v-model="r.team">
							<option disabled selected>Equipes</option>
							<option :value="value" v-for="(value, key) in teams" :key="key">{{ value }}</option>
						</select>
					</div>
				</td>
				<td>
					<div class="select is-small">
						<select v-model="r.transacType">
							<option disabled selected>Types</option>
							<option :value="value" v-for="(value, key) in types" :key="key">{{ value }}</option>
						</select>
					</div>
				</td>
				<td>
					<p>
						<span
							class="tag"
							:class="{
								'is-success' : isPositive(r.ttcAmount),
								'is-danger' : !isPositive(r.ttcAmount )
							}">
							{{ r.ttcAmount }} € TTC
						</span>
					</p>
					<p>
						<span
							class="tag"
							:class="{
								'is-success' : isPositive(htAmount(r.ttcAmount, r.tvaRate)),
								'is-danger' : !isPositive(htAmount(r.ttcAmount, r.tvaRate))
							}">
							{{ htAmount(r.ttcAmount, r.tvaRate) }} € HT
						</span>
					</p>
				</td>
				<td>
					<div class="field">
						<div class="field">
							<p class="control">
								<input class="input is-small" type="number" v-model="r.tvaRate">
							</p>
						</div>
					</div>
				</td>
				<td>
					<div class="field">
						<p class="control">
							<input class="input is-small" type="number" v-model="r.ventilation">
						</p>
					</div>
				</td>
				<td>
					<div class="field">
						<p class="control">
							<input class="input is-small" type="number" v-model="r.relatifStart">
						</p>
					</div>
				</td>
				<td>
					<div class="field">
						<p class="control">
							<input class="input is-small" type="number" v-model="r.relatifEnd">
						</p>
					</div>
				</td>
				<td class="table-icon">
					<a @click="save(r)">
						<i class="fas fa-save"></i>
					</a>
				</td>
			</tr>
  	</tbody>
	</table>
</template>

<script>
import axios from 'axios';

export default {
	props: {
		data: Array,
	},

	data () {
		return {
			categories: [
				'1-Ventes',
				'2-Coûts variables',
				'3-Coûts fixes',
				'4-Entrées financières',
				'5-Sorties financières'
			],
			teams: [
				'Administratif',
				'Anh-Tuan',
				'Company',
				'Exec',
				'Frank',
				'Marketing',
				'Montpellier',
				'Paris',
				'Produit',
				'Sales',
				'Tech'
			],
			types: [
				'Abonnement Organisations',
				'Abonnement Outils',
				'Matériel informatique',
				'Assurances',
				'Compte Courrant d\'Associé',
				'Conseils',
				'Cotisations Sociales',
				'Evenements',
				'Fournisseurs Ad Tech',
				'Frais administratifs',
				'Frais bancaires',
				'Frais comptables',
				'Frais d\'aménagement',
				'Frais de transport',
				'Frais de fonctionnement',
				'Frais de mission',
				'Frais de réception',
				'Frais juridiques',
				'Hôtels',
				'Infrastructure informatique',
				'Investissement financiers',
				'Loyer',
				'Mutuelle et Prevoyance',
				'Petites fournitures',
				'Prêt',
				'Restaurants',
				'Salaires',
				'Tickets Restaurants',
				'Vehicule',
				'Vente de services',
				'Vente Refresh',
				'Intérêts financiers',
				'Taxes',
				'Cotisations Retraite'
			],
		};
	},

	methods: {
		htAmount (amount, tvaRate) {
			const math = amount / (1 + (tvaRate / 100));

			return Number(Math.round(math+'e2')+'e-2');
		},
		isPositive (amount) {
			return amount > 0;
		},
		save (object) {
			axios.post('/rows', object)
			.then( (response) => {
				object.hasModel = true;
      }).catch( (err) => {
				console.log('Error:', err);
      });
		},
	}
};
</script>

<style>
.table-icon {
	text-align: center;
	vertical-align: middle !important;
}
.table-icon > a {
	color: hsl(171, 100%, 41%);
}
.row-has-model {
	background-color: #f5fffd;
}
</style>
