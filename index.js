const app = Vue.createApp({
	data() {
		return {
			faction: "All",
      flanking: "All",
			allShips: data
		}
	},
	computed: {
		rows() { // All the rows to be shown
			
			var ships = this.allShips;

			if (this.faction !== "All") {
				ships = ships.filter(ship => ship.faction==this.faction);
			}

			
			if (this.flanking !== "All") {
				ships = ships.filter(ship => ship.flanking==this.flanking);
			}
			
			
			console.log("ships.length: " + ships.length)
			
			return ships;
		},
		factionOptions() {

			var ships = this.allShips;
			var key = "faction";
			
			var result = new Set();
			ships.forEach(function(item) {
        if (item.hasOwnProperty(key)) {
            result.add(item[key]);
        }
    	});
		
			var opts = [{value: "All", text: "All"}];
			
			result.forEach(function(item) {
				var obj = {};
				obj.value = item;
				obj.text = item;
				opts.push(obj);
			});
			
			console.log("factionOptions called");
			
			return opts;
		},
		flankingOptions() {

			var ships = this.allShips;
			var key = "flanking";
			
			var result = new Set();
			ships.forEach(function(item) {
        if (item.hasOwnProperty(key)) {
            result.add(item[key]);
        }
    	});
		
			var opts = [{value: "All", text: "All"}];
			
			result.forEach(function(item) {
				var obj = {};
				obj.value = item;
				obj.text = item;
				opts.push(obj);
			});
			
			console.log("flankingOptions called");
			
			return opts;
		}

	}
})

app.mount('#app')
