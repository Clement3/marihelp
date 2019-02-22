import Vue from 'vue'
import Home from '@/components/Home.vue'
import Rows from '@/components/Rows.vue'
import JsonCSV from 'vue-json-csv'

Vue.component('downloadCsv', JsonCSV)

new Vue({
  el: '#app',
  components: { Home, Rows },
})
