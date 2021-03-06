// main script file. utils.js defines objects used
// Author: Joseph Doiron



// get the canvas element and context object that handles the drawing
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
// define each player's (x and o) builders 
// each player gets two builders
let b_x_one = new Builder('x', new Point(20, 60));
let b_x_two = new Builder('x', new Point(20, 110));
let b_y_one = new Builder('o', new Point(20, 160));
let b_y_two = new Builder('o', new Point(20, 210));
// put them in an array to access later
let builders = [b_x_one, b_x_two, b_y_one, b_y_two];
// defiene the game board
let board = new Board(5, 5, 100, 100, 100, builders);
// define players. this is used to change the turn
let players = ['x','o'];
// global variables used for handling different events in the game
let moved_builder = false;
let mouse_down = false;
let builder_selected = false;
let moving_builder = null;
let turn = 'x';
let all_initialized = false;
let player_moved = false;
// loop controllers
let initializing = true;
let moving = false;
let building = false;
let first_move = true;

//************** helpers *******************************
function get_other_player(current_player) {
	return players.filter(p => p !== current_player).toString();
}

function player_initialized_builders(player) {
	if (builders.filter(b => b.owner === player).every(b => b.initialized)) {
		return true;
	}
	return false;
}
//************** stages of game functions ******************

// handles animations and control when player's are firs tplacing builders
function initialize() {
	let other_player = get_other_player(turn);
	if (player_initialized_builders(turn) && !player_initialized_builders(other_player)) {
		turn = other_player;
	} else if (builders.every(b => b.initialized)) {
		all_initialized = true;
		initializing = false;
		moving = true;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`${turn} placing builders`, 10, 20);
    board.draw(ctx);

    if (initializing) {
    	requestAnimationFrame(initialize);
    }
}

// handles part of game when player moves a builder
function move() {

	if (first_move) {
		turn = get_other_player(turn);
		first_move = false;
	}

	if (moved_builder && !initializing) {
		moved_builder = false;
		player_moved = true;
	}

	if (player_moved) {
		moving = false;
		player_moved = false;
		building = true;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`${turn} moving builder`, 10, 20);
    board.draw(ctx);

    if (moving) {
    	requestAnimationFrame(move);
    }
}

// handles part of game when player builds up a space
function build() {

	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`${turn} build`, 10, 20);
    board.draw(ctx);

    if (moving) {
    	requestAnimationFrame(build);
    }
}


// main function handles all stages of game
function main() {
	if (initializing) {
		initialize();
	} else if (moving) {
		move();
	} else if (building) {
		build();
	}

	requestAnimationFrame(main);
}

// call main
main();


//**************** add and define event listeners *************************
canvas.addEventListener("mousedown", function(event) {
    mouse_down = true;
    let rect = canvas.getBoundingClientRect();
    let mouse_x = event.clientX - rect.left;
    let mouse_y = event.clientY - rect.top;
    let mouse_location = new Point(mouse_x, mouse_y);
    let builder = board.get_builder_selected(mouse_location, turn);
    if (builder !== null && !building) {
        builder_selected = true;
        moving_builder = builder;
    }
});

canvas.addEventListener("mousemove", function(event) {
    if (mouse_down && builder_selected) {
        let rect = canvas.getBoundingClientRect();
        let mouse_x = event.clientX - rect.left;
        let mouse_y = event.clientY - rect.top;
        moving_builder.change_center(mouse_x, mouse_y);
    }
});

canvas.addEventListener("mouseup", function(event) {
        mouse_down = false;
        let rect = canvas.getBoundingClientRect();
        let mouse_x = event.clientX - rect.left;
        let mouse_y = event.clientY - rect.top;
        let mouse_location = new Point(mouse_x, mouse_y);

        if (builder_selected) {

            builder_selected = false;
            let space = board.get_builder_current_space(moving_builder);

            if (space !== null && moving_builder.space !== null) {
                if (space.is_space_adjacent(moving_builder.space) && (space.level - moving_builder.space.level) <= 1) {
                    space.add_builder(moving_builder);
                    if (!initializing && !moving_builder.sent_back) {
                        moved_builder = true;
                    }
                } else {
                    moving_builder.go_back_to_space();
                }
            } else if (space !== null && moving_builder.space === null) {
                space.add_builder(moving_builder);
                if (!initializing && !moving_builder.sent_back) {
                    moved_builder = true;
                }
            } else {
                moving_builder.go_back_to_initial_spot();
            }
    
            moving_builder = null;

        } else if (building) {

            let highlighted_space = board.get_highlighted_space();
            let space = board.get_selected_space(mouse_location);
            if (highlighted_space !== null) {
                highlighted_space.unhighlight();
            }
            if (highlighted_space === space) {
            	let player_builders = builders.filter(b => b.owner === turn);
            	let builder_adjacent = player_builders.some(b => highlighted_space.is_space_adjacent(b.space));
            	console.log(builder_adjacent);
            	if (highlighted_space.level < 4 && !highlighted_space.has_builder && builder_adjacent) {
            		highlighted_space.add_level();
            		building = false;
                	moving = true;
                	turn = get_other_player(turn);
            	}
            } else {
                space.highlight();
            }
        }

});

