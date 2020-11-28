let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let b_x_one = new Builder('x', new Point(20, 60));
let b_x_two = new Builder('x', new Point(20, 110));
let b_y_one = new Builder('o', new Point(20, 160));
let b_y_two = new Builder('o', new Point(20, 210));
let builders = [b_x_one, b_x_two, b_y_one, b_y_two];
let board = new Board(5, 5, 100, 100, 100, builders);
let players = ['x','o'];
let turn = 'x';
let moved_builder = false;
let mouse_down = false;
let builder_selected = false;
let all_initialized = false;
let moving_builder = null;
let game_state = 'x initialize builders';

function refresh() {
    if (builders.filter(b => b.owner === turn).every(b => b.initialized) && !all_initialized) {
        game_state = 'o initialize builders';
        turn = 'o';
    }
    if (moved_builder && builders.every(b => b.initialized)) {
        all_initialized = true;
        console.log(moved_builder);
        turn = players.filter(p => p !== turn).toString();
        console.log(turn);
        game_state = `${turn} move`;
        moved_builder = false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`${game_state}`, 10, 20);
    board.draw(ctx);
	window.requestAnimationFrame(refresh);
}


canvas.addEventListener("mousedown", function(event) {
    mouse_down = true;
    let rect = canvas.getBoundingClientRect();
    let mouse_x = event.clientX - rect.left;
    let mouse_y = event.clientY - rect.top;
    let mouse_location = new Point(mouse_x, mouse_y);
    let builder = board.get_builder_selected(mouse_location, turn);
    console.log(builder);
    if (builder !== null) {
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
        console.log(moving_builder.center);
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
                if (space.is_space_adjacent(moving_builder.space)) {
                    space.add_builder(moving_builder);
                    if (builders.every(b => b.initialized)) {
                        moved_builder = true;
                    }
                } else {
                    moving_builder.go_back_to_space();
                }
            } else if (space !== null && moving_builder.space === null) {
                space.add_builder(moving_builder);
                if (builders.every(b => b.initialized)) {
                    moved_builder = true;
                }
            } else {
                moving_builder.go_back_to_initial_spot();
            }
    
            moving_builder = null;
        } else {
            highlighted_space = board.get_highlighted_space();
            space = board.get_selected_space(mouse_location);
            if (highlighted_space !== null) {
                highlighted_space.unhighlight();
            }
            if (highlighted_space === space) {
                space.unhighlight();
            } else {
                space.highlight();
            }
        }

});

refresh();