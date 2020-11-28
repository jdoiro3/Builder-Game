let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let b_x_one = new Builder('x', new Point(20, 40));
let b_x_two = new Builder('x', new Point(20, 90));
let b_y_one = new Builder('y', new Point(20, 140));
let b_y_two = new Builder('y', new Point(20, 190));
let builders = [b_x_one, b_x_two, b_y_one, b_y_two];

let board = new Board(5, 5, 100, 100, 100, builders);
let turn = 'x';
let mouse_down = false;
let builder_selected = false;
let moving_builder = null;


function refresh() {
    //console.log(moving_builder);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.draw(ctx);
	window.requestAnimationFrame(refresh);
}


canvas.addEventListener("mousedown", function(event) {
    mouse_down = true;
    let rect = canvas.getBoundingClientRect();
    let mouse_x = event.clientX - rect.left;
    let mouse_y = event.clientY - rect.top;
    let mouse_location = new Point(mouse_x, mouse_y);
    let builder = board.get_builder_selected(mouse_location);
    console.log(builder);
    if (builder !== null) {
        builder_selected = true;
        moving_builder = builder;
    }
});

canvas.addEventListener("mousemove", function(event) {
    if (mouse_down) {
        let rect = canvas.getBoundingClientRect();
        let mouse_x = event.clientX - rect.left;
        let mouse_y = event.clientY - rect.top;
        if (builder_selected) {
            moving_builder.change_center(mouse_x, mouse_y);
            console.log(moving_builder.center);
        }
    }
});

canvas.addEventListener("mouseup", function(event) {
        mouse_down = false;
        builder_selected = false;
        let space = board.get_builder_current_space(moving_builder);
        let rect = canvas.getBoundingClientRect();
        let mouse_x = event.clientX - rect.left;
        let mouse_y = event.clientY - rect.top;
        let mouse_location = new Point(mouse_x, mouse_y);

        console.log(space);
        if (space !== null) {
            console.log("assigning space");
            space.add_builder(moving_builder);
        }

        moving_builder = null;

});

refresh();