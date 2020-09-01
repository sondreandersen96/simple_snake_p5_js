// Game settings
let gameSettings = {
	'screen_x': 600,
	'screen_y': 600,
	'frame_rate': 10,
	'background_color': 100,
	'scale': 20, // is the number of pixels each object can take, and move per frame
	'is_alive': true,
	'snake_color': 255,
	'snake_head_color_red': 255,
	'snake_head_color_green': 10,
	'snake_head_color_blue': 10,
	'super_food_color': [200, 10, 100],
	'score_color': [1, 1, 1],
	'score_text_size': 17,
	'frameCount': 0,
	'food_color': [10, 255, 10],
	'normal_food_points': 100,
	'super_food_points': 500,
	'super_food_probability': 995,
	'super_food_duration': 50,
};

let scoreboard;
let snake;
let food;
let special_items_controller;
let superfood;





// Setup function
function setup() {
	createCanvas(gameSettings['screen_x'], gameSettings['screen_y']);
	frameRate(gameSettings['frame_rate']);

	scoreboard = new ScoreBoard();
	snake = new Snake();
	food = new Food(Math.round(random(0, 29))*20, Math.round(random(0, 29))*20);
	special_items_controller = new Special_items_controller();

}

// Main loop
function draw() {
	background(gameSettings['background_color']);


	// Handling user-input
	// .. and prevents that the user can move the opposite direction that she is already moving
	if (keyIsDown(LEFT_ARROW) && snake.previous_directions.slice(-1)[0] !== 'right') {
		snake.direction = 'left';
		print('left');
	} else if (keyIsDown(RIGHT_ARROW) && snake.previous_directions.slice(-1)[0] !== 'left') {
		snake.direction = 'right';
		print('right');
	} else if (keyIsDown(UP_ARROW) && snake.previous_directions.slice(-1)[0] !== 'down') {
		snake.direction = 'up';
		print('up');
	} else if (keyIsDown(DOWN_ARROW) && snake.previous_directions.slice(-1)[0] !== 'up') {
		snake.direction = 'down';
		print('down');
	}


	// While the player has not triggered a "game-over" event
	// ... the game playes as usual
	if (gameSettings['is_alive'] == true) {
		// Snake events
		snake.move();
		snake.is_on_screen();
		snake.tail_intersected();
		snake.render();



		// Food events
		food.render();
		food.intersected(snake);



		// Render score
		scoreboard.render_score();

		// Special items handling
		r = random(0, 1000);
		if (r > gameSettings['super_food_probability'] && special_items_controller.superfood.length == 0) {
			superfood = new Superfood();
			special_items_controller.superfood.push(superfood);
		}
		for (let i = 0; i < special_items_controller.superfood.length; i++) {
			let super_food = special_items_controller.superfood[i];
			super_food.intersected(snake);
			super_food.check_for_time_out();
			super_food.render();

		}


	} else {
		// "Game over"-screen
		let current_highScore = scoreboard.getHighScore();
		if (scoreboard.score > current_highScore) {
			scoreboard.render_high_score_screen();
		} else {
			scoreboard.render_game_over_screen();
		}
	}

	// Tracking the number of frames that have passed since
	// ... the program was first started.
	gameSettings['frameCount']++;
}


// Classes
class Snake {
	constructor() {
		// Storing properties of the snake object
		let middle_of_screen_x = gameSettings['screen_x'] / 2;
		let middle_of_screen_y = gameSettings['screen_y'] / 2;
		this.x = middle_of_screen_x;
		this.y = middle_of_screen_y;
		this.direction = 'right';
		this.previous_directions = ['right'];
		this.history_x = [];
		this.history_y = [];
		this.tail_length = 2;
		}
	move() {
		if (this.direction === 'up') {
			this.y = this.y - gameSettings['scale'];
			print('Moving up');
		} else if (this.direction === 'down') {
			this.y = this.y + gameSettings['scale'];
			print('Moving down');
		} else if (this.direction === 'right') {
			this.x = this.x + gameSettings['scale'];
			print('Moving right');
		} else if (this.direction === 'left') {
			this.x = this.x - gameSettings['scale'];
			print('Moving left');
		}
		this.history_x.push(this.x);
		this.history_y.push(this.y);
		this.previous_directions.push(this.direction);
	}
	add_tail(additional_lenght_of_tail) {
		this.tail_length = this.tail_length + additional_lenght_of_tail;
	}

	// Test whether the snake is on or off the screen
	is_on_screen() {
		if (this.x > gameSettings['screen_x'] - gameSettings['scale'] ||
	 		this.y > gameSettings['screen_y'] - gameSettings['scale'] ||
	 		this.x < 0 || this.y < 0) {
			gameSettings['is_alive'] = false;
		} else {
			gameSettings['is_alive'] = true;
		}
	}

	// Test if the tail of the snake has been intercepted by the snake's head
	tail_intersected() {
		let tail_x = this.history_x.slice(this.history_x.length - this.tail_length, this.history_x.length-1);
		let tail_y = this.history_y.slice(this.history_y.length - this.tail_length, this.history_y.length-1);
		print('tail_x and tail_y: ', tail_x, tail_y);
		print(this.tail_length);

		for (let i = 0; i < tail_x.length; i++) {
			if (this.x == tail_x[i] && this.y == tail_y[i]) {
				gameSettings['is_alive'] = false;
				print('Tail bitten');
			}
		}

	}

	// Draw the snake on the canvas based on its current properties and location
	render() {
		let color_red = gameSettings['snake_head_color_red'];
		let color_green = gameSettings['snake_head_color_green'];
		let color_blue = gameSettings['snake_head_color_blue'];
		let color = gameSettings['snake_color'];

		fill(color);

		let tail_x = this.history_x.slice(this.history_x.length - this.tail_length, this.history_x.length);
		let tail_y = this.history_y.slice(this.history_y.length - this.tail_length, this.history_y.length);

		for (let i = 0; i < tail_x.length; i++) {
			rect(tail_x[i], tail_y[i], gameSettings['scale'], gameSettings['scale']);
		}

		fill(color_red, color_green, color_blue);
		rect(this.x, this.y, gameSettings['scale'], gameSettings['scale']);
	}



}




// Class for food objects
class Food {
	constructor(x_position, y_position) {
		this.x = x_position;
		this.y = y_position;
	}

	// Detect when another object (the snake) interacts with this object
	// .. this is used to detect when the snake "eats" a piece of food
	intersected(other) {
		if (this.x == other.x && this.y == other.y) {
			other.add_tail(1);
			scoreboard.score = scoreboard.score + gameSettings['normal_food_points'];
			food = new Food(Math.round(random(0, 29))*20, Math.round(random(0, 29))*20);
		}
	}

	// Render the food on the canvas
	render() {
		fill(gameSettings['food_color'][0], gameSettings['food_color'][1], gameSettings['food_color'][2]);
		rect(this.x, this.y, gameSettings['scale'], gameSettings['scale']);
	}
}







// This class keeps track on everything score related such as current score
// ... reading highscores from the browser's localstorage and can render
// ... different game-over screens
class ScoreBoard {
	constructor() {
		this.score = 0;
		this.foods_eaten = 0;
	}
	render_score() {
		fill(gameSettings['score_color'][0], gameSettings['score_color'][1], gameSettings['score_color'][2]);
		textSize(gameSettings['score_text_size']);
		text('Score: ' + this.score, 10, 25);

	}

	getHighScore() {
		return localStorage.getItem('highScore');
	}

	setNewHighScore() {
		let current_highscore = this.getHighScore();
		if (this.score > current_highscore) {
			localStorage.setItem('highScore', this.score);
		}
	}

	render_game_over_screen() {
		fill(255, 30, 20);
		textSize(40);
		text('Game Over!', 200, 300);

		fill(10);
		textSize(32);
		text('Score: ' + this.score , 250, 350);

		textSize(25);
		text('Current High Score: ' + this.getHighScore(), 170, 385);
		frameRate(0);
	}


	render_high_score_screen() {
		fill(255, 30, 20);
		textSize(40);
		text('Game Over!', 200, 300);

		fill(10);
		textSize(32);
		text('Score: ' + this.score, 230, 350);

		fill(10, 255, 10);
		textSize(35);
		text('Congratulations!', 170, 420);
		text('You just set a new HIGH SCORE!', 40, 470);

		fill(30);
		textSize(20);
		text('Previous high score was: ' + this.getHighScore(), 180, 500);

		this.setNewHighScore();

		frameRate(0);

	}


}



// This class can keep track of special-items in the game
// ... for now the only special item avalible is the superfood item
class Special_items_controller {
	constructor() {
		this.superfood = [];
		this.items = []; // Contains all the special items
	}

}


// This class allows for the creation of a "superfood" that gives extra
// ... points, but disapeares after a specified amount of time.
class Superfood {
	constructor() {
		this.x = Math.round(random(0, 29))*20;
		this.y = Math.round(random(0, 29))*20;
		this.start = gameSettings['frameCount'];
		this.end = gameSettings['frameCount'] + gameSettings['super_food_duration'];
	}

	check_for_time_out() {
		if (gameSettings['frameCount'] >= this.end) {
			special_items_controller.superfood.pop();
		}
	}

	intersected(other) {
		if (this.x == other.x && this.y == other.y) {
			other.add_tail(1);
			scoreboard.score = scoreboard.score + gameSettings['super_food_points'];
			special_items_controller.superfood.pop();
		}
	}

	render() {
		fill(gameSettings['super_food_color'][0], gameSettings['super_food_color'][1], gameSettings['super_food_color'][2]);
		rect(this.x, this.y, gameSettings['scale'], gameSettings['scale']);

		// Render time to superfood disapeares
		fill(255);
		textSize(14);
		let time_left = this.end - gameSettings['frameCount'];
		if (time_left < 10) {
			text(time_left, this.x + 6, this.y + 15);
		} else {
			text(time_left, this.x + 2, this.y + 15);
		}
	}

}
