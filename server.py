import bottle
from bottle import request, response
import glob
import os.path as path
import json

is_server = None
try:
    import pdfkit
except ImportError:
    try:
        from weasyprint import HTML
    except ImportError:
        import sys
        print('no pdfkit or weasyPrint is installed. exiting...')
        sys.exit(1)
    else:
        is_server = True

        def convert(html):
            return HTML(string=html).write_pdf()
else:
    is_server = False
    config = pdfkit.configuration(
        wkhtmltopdf='wkhtmltopdf/bin/wkhtmltopdf.exe')

    def convert(html):
        try:
            html = html.decode('utf8')
        except Exception:
            pass
        return pdfkit.from_string(html, False, configuration=config)

bottle.BaseRequest.MEMFILE_MAX = 1024 * 1024 * 1024
app = bottle.Bottle()
CONTENT_DIR = '.'


@app.route('/')
def index():
    return bottle.static_file('index.html', root=CONTENT_DIR)


@app.route('/<path:path>')
def static(path):
    return bottle.static_file(path, root=CONTENT_DIR)


@app.route('/langs')
def get_languages():
    def read_file(filename):
        with open(filename, 'r') as f:
            return json.load(f)

    def get_code(file_path):
        return path.splitext(path.basename(file_path))[0]

    files = glob.glob(CONTENT_DIR + '/langs/*.json')
    langs = dict((get_code(p), read_file(p)) for p in files)

    return json.dumps(langs, ensure_ascii=False).encode('utf8')


@app.post('/convertPdf')
def convert_pdf():
    pdf = convert(request.POST['html'])
    response.set_header('Content-Type', 'application/pdf')
    response.set_header('Content-Disposition', 'attachment')
    return pdf


if is_server:
    application = app
elif __name__ == '__main__':
    bottle.run(app, host='localhost', port=80)
