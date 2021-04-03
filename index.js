const app = Vue.createApp({
	data() {
		return {
			name: "",
			source: "All",
			fa: "All",
			fore: "All",
			aft: "All",
			flanking: "All",
			allShips: data
		}
	},
	computed: {
		rows() { // All the rows to be shown
			
			var ships = this.allShips;

			if (this.name !== "") {
				ships = ships.filter(ship => ship.name.toLowerCase().includes(this.name.toLowerCase()));
			}

			if (this.source !== "All") {
				ships = ships.filter(ship => ship.source===this.source);
			}

			if (this.fore !== "All") {
				ships = ships.filter(ship => ship.fore===this.fore);
			}

			if (this.aft !== "All") {
				ships = ships.filter(ship => ship.aft===this.aft);
			}


			if (this.fa !== "All") {
				ships = ships.filter(ship => ship.fa===this.fa);
			}

			
			if (this.flanking !== "All") {
				ships = ships.filter(ship => ship.flanking===this.flanking);
			}
			
			console.log("ships.length: " + ships.length)
			
			return ships;
		},
		sourceOptions() {
			return this.getOpts("source");
		},
		foreOptions() {
			return this.getOpts("fore");
		},
		aftOptions() {
			return this.getOpts("aft");
		},
		faOptions() {
			return this.getOpts("fa");
		},
		flankingOptions() {
			return this.getOpts("flanking");
		}
	},
	methods:{
		getOpts(key) {
			result = Array.from(new Set(this.allShips.map(item => item[key]))).sort();
			result.unshift("All");
			
			var opts = [];
			result.forEach(function(item) {
				var obj = {};
				obj.value = item;
				obj.text = item;
				opts.push(obj);
			});
			
			return opts;
		}
	}
})

app.mount('#app')
