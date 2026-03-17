from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

DATABASE = 'houses.db'


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """Create the houses table on startup when it does not exist."""
    with get_connection() as connection:
        connection.execute(
            '''
            CREATE TABLE IF NOT EXISTS houses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                location TEXT NOT NULL,
                price TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Available'
            )
            '''
        )


init_db()


@app.route('/')
def index():
    with get_connection() as connection:
        houses = connection.execute(
            'SELECT id, title, location, price, status FROM houses ORDER BY id DESC'
        ).fetchall()

    return render_template('index.html', houses=houses)


@app.route('/add', methods=['GET', 'POST'])
def add_house():
    error = None

    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        location = request.form.get('location', '').strip()
        price = request.form.get('price', '').strip()

        if not title or not location or not price:
            error = 'Title, location, and price are required.'
        else:
            with get_connection() as connection:
                connection.execute(
                    'INSERT INTO houses (title, location, price) VALUES (?, ?, ?)',
                    (title, location, price),
                )
            return redirect(url_for('index'))

    return render_template('add_house.html', error=error)


@app.route('/sold/<int:id>', methods=['POST'])
def mark_sold(id):
    with get_connection() as connection:
        connection.execute("UPDATE houses SET status = 'Sold' WHERE id = ?", (id,))
    return redirect(url_for('index'))


@app.route('/delete/<int:id>', methods=['POST'])
def delete_house(id):
    with get_connection() as connection:
        connection.execute('DELETE FROM houses WHERE id = ?', (id,))
    return redirect(url_for('index'))


if __name__ == '__main__':
    app.run(debug=True)
