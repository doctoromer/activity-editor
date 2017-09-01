import bottle
from bottle import request, response
import pdfkit
import glob
import os.path as path
import json

app = bottle.Bottle()
config = pdfkit.configuration(wkhtmltopdf='wkhtmltopdf/bin/wkhtmltopdf.exe')
CONTENT_DIR = '.'


@app.route('/')
def index():
    return bottle.static_file('index.html', root=CONTENT_DIR)


@app.route('/<path:path>')
def static(path):
    return bottle.static_file(path, root=CONTENT_DIR)


@app.route('/langs')
def get_languages():
    def get_name(path):
        with open(path, 'r') as f:
            return json.load(f)['name']
    ls = glob.glob(CONTENT_DIR + '/langs/*.json')
    langs = dict((path.splitext(path.basename(p))[0], get_name(p)) for p in ls)
    return langs


@app.post('/convertPdf')
def convert_pdf():
    pdf = pdfkit.from_string(
        request.POST['html'], False, configuration=config)
    response.set_header('Content-Type', 'application/pdf')
    response.set_header('Content-Disposition', 'attachment')
    return pdf


if __name__ == '__main__':
    bottle.run(app, host='localhost', port=80)
