const app = Vue.createApp({
	data() {
		return {
			name: "",
			source: "All",
			bundle: "All",
			starter: "All",
			faction: "All",
			family: "All",
			masterypackage: "All",
			fa: "All",
			fore: "All",
			aft: "All",
			dhc: "All",
			exp: "All",
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
			
			if (this.bundle !== "All") {
				ships = ships.filter(ship => ship.bundle===this.bundle);
			}
			
			if (this.starter !== "All") {
				ships = ships.filter(ship => ship.starter===this.starter);
			}

			if (this.faction !== "All") {
				ships = ships.filter(ship => ship.faction===this.faction);
			}

			if (this.family !== "All") {
				ships = ships.filter(ship => ship.family===this.family);
			}

			if (this.masterypackage !== "All") {
				ships = ships.filter(ship => ship.masterypackage===this.masterypackage);
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

			if (this.dhc !== "All") {
				ships = ships.filter(ship => ship.dhc===this.dhc);
			}

			if (this.exp !== "All") {
				ships = ships.filter(ship => ship.exp===this.exp);
			}

			if (this.flanking !== "All") {
				ships = ships.filter(ship => ship.flanking===this.flanking);
			}
			
			console.log("ships.length: " + ships.length)
			
			ships.sort((a, b) => (a.name > b.name) ? 1 : -1)
			
			return ships;
		},
		sourceOptions() {	
			return this.getOpts("source");
		},
		bundleOptions() {	
			return this.getOpts("bundle");
		},
		starterOptions() {	
			return this.getOpts("starter");
		},
		factionOptions() {	
			return this.getOpts("faction");
		},
		familyOptions() {	
			return this.getOpts("family");
		},
		masterypackageOptions() {	
			return this.getOpts("masterypackage");
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
		dhcOptions() {
			return this.getOpts("dhc");
		},
		expOptions() {
			return this.getOpts("exp");
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
