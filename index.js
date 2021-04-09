const app = Vue.createApp({
	data() {
		return {
			name: "",
			source: "Any",
			bundle: "Any",
			starter: "Any",
			faction: "Any",
			family: "Any",
			masterypackage: "Any",
			fa: "Any",
			fore: "Any",
			aft: "Any",
			dhc: "Any",
			exp: "Any",
			hangars: "Any",
			dev: "Any",
			fleet: "Any",
			taccons: "Any",
			engcons: "Any",
			scicons: "Any",
			unicons: "Any",
			secdef: "Any",
			subtargeting: "Any",
			sensoranalysis: "Any",
			singularity: "Any",
			cloak: "Any",
			flanking: "Any",
			allShips: data
		}
	},
	computed: {
		rows() { // All the rows to be shown
			
			var ships = this.allShips;

			if (this.name !== "") {
				ships = ships.filter(ship => ship.name.toLowerCase().includes(this.name.toLowerCase()));
			}

			if (this.source !== "Any") {
				ships = ships.filter(ship => ship.source===this.source);
			}
			
			if (this.bundle !== "Any") {
				ships = ships.filter(ship => ship.bundle===this.bundle);
			}
			
			if (this.starter !== "Any") {
				ships = ships.filter(ship => ship.starter===this.starter);
			}

			if (this.faction !== "Any") {
				ships = ships.filter(ship => ship.faction===this.faction);
			}

			if (this.family !== "Any") {
				ships = ships.filter(ship => ship.family===this.family);
			}

			if (this.masterypackage !== "Any") {
				ships = ships.filter(ship => ship.masterypackage===this.masterypackage);
			}

			if (this.fore !== "Any") {
				ships = ships.filter(ship => ship.fore===this.fore);
			}

			if (this.aft !== "Any") {
				ships = ships.filter(ship => ship.aft===this.aft);
			}

			if (this.fa !== "Any") {
				ships = ships.filter(ship => ship.fa===this.fa);
			}

			if (this.dhc !== "Any") {
				ships = ships.filter(ship => ship.dhc===this.dhc);
			}

			if (this.exp !== "Any") {
				ships = ships.filter(ship => ship.exp===this.exp);
			}

			if (this.hangars !== "Any") {
				ships = ships.filter(ship => ship.hangars===this.hangars);
			}

			if (this.dev !== "Any") {
				ships = ships.filter(ship => ship.dev===this.dev);
			}

			if (this.fleet !== "Any") {
				ships = ships.filter(ship => ship.fleet===this.fleet);
			}

			if (this.taccons !== "Any") {
				ships = ships.filter(ship => ship.taccons===this.taccons);
			}

			if (this.engcons !== "Any") {
				ships = ships.filter(ship => ship.engcons===this.engcons);
			}

			if (this.scicons !== "Any") {
				ships = ships.filter(ship => ship.scicons===this.scicons);
			}

			if (this.unicons !== "Any") {
				ships = ships.filter(ship => ship.unicons===this.unicons);
			}
			
			if (this.secdef !== "Any") {
				ships = ships.filter(ship => ship.secdef===this.secdef);
			}

			if (this.subtargeting !== "Any") {
				ships = ships.filter(ship => ship.subtargeting===this.subtargeting);
			}

			if (this.sensoranalysis !== "Any") {
				ships = ships.filter(ship => ship.sensoranalysis===this.sensoranalysis);
			}

			if (this.singularity !== "Any") {
				ships = ships.filter(ship => ship.singularity===this.singularity);
			}

			if (this.cloak !== "Any") {
				ships = ships.filter(ship => ship.cloak===this.cloak);
			}

			if (this.flanking !== "Any") {
				ships = ships.filter(ship => ship.flanking===this.flanking);
			}
			
			console.log("ships.length: " + ships.length)
			
			//ships.sort((a, b) => (a.name > b.name) ? 1 : -1)
			
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
		hangarsOptions() {
			return this.getOpts("hangars");
		},
		devOptions() {
			return this.getOpts("dev");
		},
		fleetOptions() {
			return this.getOpts("fleet");
		},
		tacconsOptions() {
			return this.getOpts("taccons");
		},
		engconsOptions() {
			return this.getOpts("engcons");
		},
		sciconsOptions() {
			return this.getOpts("scicons");
		},
		uniconsOptions() {
			return this.getOpts("unicons");
		},
		secdefOptions() {
			return this.getOpts("secdef");
		},
		subtargetingOptions() {
			return this.getOpts("subtargeting");
		},
		sensoranalysisOptions() {
			return this.getOpts("sensoranalysis");
		},
		singularityOptions() {
			return this.getOpts("singularity");
		},
		cloakOptions() {
			return this.getOpts("cloak");
		},
		flankingOptions() {
			return this.getOpts("flanking");
		}
	},
	methods:{
		getOpts(key) {
			result = Array.from(new Set(this.allShips.map(item => item[key]))).sort();
			result.unshift("Any");
			
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
