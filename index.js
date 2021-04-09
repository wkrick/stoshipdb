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
			int: "Any",
			cmd: "Any",
			pil: "Any",
			tmp: "Any",
			mw: "Any",
			hull: "Any",
			hmod: "Any",
			smod: "Any",
			turn: "Any",
			imp: "Any",
			inrt: "Any",
			wpower: "Any",
			spower: "Any",
			epower: "Any",
			apower: "Any",
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
			weapon: "Any",
			shield: "Any",
			engine: "Any",
			threat: "Any",
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
			
			if (this.int !== "Any") {
				ships = ships.filter(ship => ship.int===this.int);
			}

			if (this.cmd !== "Any") {
				ships = ships.filter(ship => ship.cmd===this.cmd);
			}

			if (this.pil !== "Any") {
				ships = ships.filter(ship => ship.pil===this.pil);
			}

			if (this.tmp !== "Any") {
				ships = ships.filter(ship => ship.tmp===this.tmp);
			}

			if (this.mw !== "Any") {
				ships = ships.filter(ship => ship.mw===this.mw);
			}

			if (this.hull !== "Any") {
				ships = ships.filter(ship => ship.hull===this.hull);
			}

			if (this.hmod !== "Any") {
				ships = ships.filter(ship => ship.hmod===this.hmod);
			}

			if (this.smod !== "Any") {
				ships = ships.filter(ship => ship.smod===this.smod);
			}

			if (this.turn !== "Any") {
				ships = ships.filter(ship => ship.turn===this.turn);
			}

			if (this.imp !== "Any") {
				ships = ships.filter(ship => ship.imp===this.imp);
			}

			if (this.wpower !== "Any") {
				ships = ships.filter(ship => ship.wpower===this.wpower);
			}

			if (this.spower !== "Any") {
				ships = ships.filter(ship => ship.spower===this.spower);
			}

			if (this.epower !== "Any") {
				ships = ships.filter(ship => ship.epower===this.epower);
			}

			if (this.apower !== "Any") {
				ships = ships.filter(ship => ship.apower===this.apower);
			}

			if (this.inrt !== "Any") {
				ships = ships.filter(ship => ship.inrt===this.inrt);
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

			if (this.weapon !== "Any") {
				ships = ships.filter(ship => ship.weapon===this.weapon);
			}

			if (this.shield !== "Any") {
				ships = ships.filter(ship => ship.shield===this.shield);
			}

			if (this.engine !== "Any") {
				ships = ships.filter(ship => ship.engine===this.engine);
			}

			if (this.threat  !== "Any") {
				ships = ships.filter(ship => ship.threat===this.threat);
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
		intOptions() {	
			return this.getOpts("int");
		},
		cmdOptions() {	
			return this.getOpts("cmd");
		},
		pilOptions() {	
			return this.getOpts("pil");
		},
		tmpOptions() {	
			return this.getOpts("tmp");
		},
		mwOptions() {	
			return this.getOpts("mw");
		},
		hullOptions() {	
			return this.getOpts("hull");
		},
		hmodOptions() {	
			return this.getOpts("hmod");
		},
		smodOptions() {	
			return this.getOpts("smod");
		},
		turnOptions() {	
			return this.getOpts("turn");
		},
		impOptions() {	
			return this.getOpts("imp");
		},
		inrtOptions() {	
			return this.getOpts("inrt");
		},
		wpowerOptions() {	
			return this.getOpts("wpower");
		},
		spowerOptions() {	
			return this.getOpts("spower");
		},
		epowerOptions() {	
			return this.getOpts("epower");
		},
		apowerOptions() {	
			return this.getOpts("apower");
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
		weaponOptions() {	
			return this.getOpts("weapon");
		},
		shieldOptions() {	
			return this.getOpts("shield");
		},
		engineOptions() {	
			return this.getOpts("engine");
		},
		threatOptions() {	
			return this.getOpts("threat");
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
