from flask import Flask, render_template, request, redirect, url_for
import sqlite3

app = Flask(__name__)

# SQLite database file used by this app.
DATABASE = 'houses.db'


def init_db():
    """Create the houses table on startup when it does not exist."""
    # Use a short-lived connection for one-time startup schema setup.
    with sqlite3.connect(DATABASE) as connection:
        # IF NOT EXISTS keeps this safe to run every time the app starts.
        connection.execute(
            '''
            CREATE TABLE IF NOT EXISTS houses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                location TEXT NOT NULL,
                price REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'Available'
            )
            '''
        )


# Initialize the database when the application starts.
init_db()

houses = []


@app.route('/')
def index():
    return render_template('index.html', houses=houses)


@app.route('/add', methods=['GET', 'POST'])
def add_house():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        price = request.form.get('price', '').strip()

        if title and price:
            houses.append({'title': title, 'price': price})

        return redirect(url_for('index'))

    return render_template('add_house.html')


if __name__ == '__main__':
    app.run(debug=True)
