from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

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
