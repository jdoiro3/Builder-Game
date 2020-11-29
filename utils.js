class Point {
    constructor(x, y, size=1) {
        this.x = x;
        this.y = y;
        this.size = size;
    }

    chngP(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx, fill=false, color='black') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
        if (fill) {
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
    
    // helper func for the class
    static distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        // get the euclidean distance
        return Math.hypot(dx, dy);
    }
}


class Circle extends Point {
    constructor(x, y, r) {
        super(x, y, r);
        this.center = new Point(x, y);
        this.r = r;
    }

    contains(p) {
        let d = Point.distance(p, this.center);
        if (d > this.r) {
            return false;
        } else {
            return true;
        }
    }

    change_center(x, y) {
        this.chngP(x, y);
        this.center.chngP(x, y);
    }

    random() {
        let r = this.r * Math.sqrt(Math.random());
        let rad = Math.random() * 2 * Math.PI;
        let x = r * Math.cos(rad) + this.center.x;
        let y = r * Math.sin(rad) + this.center.y;
        return new Point(x,y);
    }

}


class Rect {
    constructor(x, y, w, h) {
        this.center = new Point(x, y, 10);
        this.w = w;
        this.h = h;
    }

    get left() {
        return this.center.x - this.w / 2;
    }

    get right() {
        return this.center.x + this.w / 2;
    }

    get top() {
        return this.center.y - this.h / 2;
    };

    get bottom() {
        return this.center.y + this.h / 2;
    };

    get topLeft() {
        return new Point(this.left, this.top);
    }

    get topRight() {
        return new Point(this.right, this.top);
    }

    get bottomLeft() {
        return new Point(this.left, this.bottom);
    }

    get bottomRight() {
        return new Point(this.right, this.bottom);
    }

    contains(p) {
        return (
        p.x >= this.left 
        &&
        p.x <= this.right
        &&
        p.y >= this.top
        &&
        p.y <= this.bottom
        )
    }

    draw(ctx, color, fill=false) {
        ctx.fillStyle = color;
        if (fill) {
            ctx.fillRect(this.topLeft.x, this.topLeft.y, this.w, this.h);
        } else {
            ctx.strokeRect(this.topLeft.x, this.topLeft.y, this.w, this.h);
        }
    }

}


class Builder extends Circle {
    constructor(owner, initial_position, space=null) {
        if (space === null) {
            super(initial_position.x, initial_position.y, 20);
        } else {
            super(space.center.x, space.center.y, 20);
        }
        this.initial_position = initial_position;
        this.space = space;
        this.sent_back = false;
        this.initialized = false;
        this.owner = owner;
        if (owner === 'x') {
            this.color = 'blue';
        } else {
            this.color = 'red';
        }
    }

    assign_space(space) {
        if (this.space === null) {
            this.space = space;
            this.initialized = true;
            this.change_center(space.center.x, space.center.y);
        } else {
            this.space.remove_builder();
            this.space = space;
            this.change_center(space.center.x, space.center.y);
        }
    }

    go_back_to_space() {
        this.change_center(this.space.center.x, this.space.center.y);
    }

    go_back_to_initial_spot() {
        this.change_center(this.initial_position.x, this.initial_position.y);
    }

    clicked(mouse_location) {
        if (this.contains(mouse_location)) {
            return true;
        }
        return false;
    }

    build(space) {
        if (this.space.is_space_adjacent(space)) {
            space.add_level();
        } else {
            console.log("not adjacent to builder");
        }
    }

    draw(ctx) {
        super.draw(ctx, true, this.color);
    }
}


class Space extends Rect {
    constructor(row, column, center, size) {
        super(center.x, center.y, size, size);
        this.color = 'black';
        this.row = row;
        this.column = column;
        this.level = 0;
        this.has_builder = false;
        this.highlighted = false;
    }

    is_space_adjacent(space) {
        if (
            (Math.abs(this.row - space.row) > 1) 
            || 
            (Math.abs(this.column - space.column) > 1)
            ) {
                return false;
        }
        return true;
    }

    highlight() {
        this.color = 'yellow';
        ctx.save();
        this.highlighted = true;
    }

    unhighlight() {
        this.color = 'black';
        this.highlighted = false;
    }

    add_builder(builder) {
        if (this.has_builder) {
            console.log("has builder");
            if (builder.space === null) {
                builder.go_back_to_initial_spot();
            } else {
                builder.go_back_to_space();
            }
        } else {
            builder.assign_space(this);
            this.has_builder = true;
        }
    }

    remove_builder() {
        this.has_builder = false;
    }

    add_level() {
        this.level += 1;
    }

    draw(ctx) {
        if (this.highlighted) {
            super.draw(ctx, this.color, true);
        } else {
            super.draw(ctx);
        }
    }

}

class Board {
    constructor(rows, columns, top_left_x, top_left_y, size, builders) {
        this.rows = rows;
        this.columns = columns;
        this.max_level = 4;
        this.spaces = {};
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                let space_x = top_left_x + size * col;
                let space_y = top_left_y + size * row;
                let p = new Point(space_x, space_y);
                this.spaces[`${row}, ${col}`] = new Space(row, col, p, size);
            }
        }
        this.builders = builders;
        this.x_initialized = false;
        this.y_initialized = false;
    }

    get_space(row, column) {
        return this.spaces[`${row}, ${column}`]
    }

    get_row(row) {
        let spaces = [];
        for (let col = 0; col < this.columns; col++) {
            spaces.push(this.get_space(row, col));
        }
        return spaces;
    }

    get_builder_current_space(builder) {
        for (let s in this.spaces) {
            let space = this.spaces[s];
            if (space.contains(builder.center)) {
                return space;
            }
        }
        return null;
    }

    get_builder_spaces(player) {
        let builder_spaces = [];
        for (let s in this.spaces) {
            if (this.spaces[s].has_builder && this.spaces[s].owner === player) {
                builder_spaces.push(this.spaces[s]);
            }
        }
        return builder_spaces;
    }

    has_adjacent_builder(space, player) {
        let builders = this.get_builder_spaces(player);
        for (let b of builders) {
            if (space.is_space_adjacent(b)) {
                return true;
            }
        }
        return false;
    }

    build(row, col, player) {
        let space = this.get_space(row, col);
        if (space.has_builder || this.has_adjacent_builder(space, player)) {
            space.add_level(this.max_level);
        }
        return false;
    }

    get_builder_selected(mouse_location, turn) {
        for (let b of this.builders) {
            if (b.clicked(mouse_location) && turn === b.owner) {
                return b;
            }
        }
        return null;
    }

    get_highlighted_space() {
        for (let s in this.spaces) {
            let space = this.spaces[s];
            if (space.highlighted) {
                return space;
            }
        }
        return null;
    }

    get_selected_space(mouse_location) {
        for (let s in this.spaces) {
            let space = this.spaces[s];
            if (space.contains(mouse_location)) {
                return space;
            }
        } 
    }

    draw(ctx) {
        for (const s in this.spaces) {
            let space = this.spaces[s];
            space.draw(ctx);
            ctx.font = '20px serif';
            ctx.fillStyle = 'black';
            ctx.fillText(`${space.level}`, space.topLeft.x + 2, space.topLeft.y + 15);
        }
        for (const b of this.builders) {
            b.draw(ctx);
        }
    }
}
