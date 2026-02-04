from flask import Flask, request, jsonify, send_file, send_from_directory
import sys
import os
import csv
import io
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from database import Database

# Resolve static folder path
if getattr(sys, 'frozen', False):
    # Running in a PyInstaller bundle
    # We will manually copy frontend folder to the executable directory
    base_dir = os.path.dirname(sys.executable)
    template_folder = os.path.join(base_dir, 'frontend')
    static_folder = os.path.join(base_dir, 'frontend')
else:
    # Running in normal Python environment - use absolute path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(backend_dir)
    template_folder = os.path.join(project_root, 'frontend')
    static_folder = os.path.join(project_root, 'frontend')

app = Flask(__name__, static_folder=static_folder, template_folder=template_folder, static_url_path='')
db = Database()

# CORS headers for API
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/')
def index():
    """Serve the main page"""
    index_path = os.path.join(app.static_folder, 'index.html')
    if not os.path.exists(index_path):
        # DEBUG: Return diagnostics if file is missing
        return jsonify({
            'error': 'Frontend file not found',
            'sought_path': index_path,
            'base_dir': os.path.dirname(sys.executable) if getattr(sys, 'frozen', False) else os.getcwd(),
            'static_folder': app.static_folder,
            'is_frozen': getattr(sys, 'frozen', False),
            'directories_in_base': os.listdir(os.path.dirname(index_path)) if os.path.exists(os.path.dirname(index_path)) else 'Parent dir missing'
        }), 404
        
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/keywords', methods=['POST'])
def add_keywords():
    """Add keywords to monitor"""
    try:
        data = request.get_json()
        keywords = data.get('keywords', [])
        
        if not keywords:
            return jsonify({'error': 'No keywords provided'}), 400
        
        # Handle both single keyword (string) and multiple keywords (list)
        if isinstance(keywords, str):
            keywords = [kw.strip() for kw in keywords.split(',') if kw.strip()]
        
        added_count = db.add_keywords_bulk(keywords)
        
        return jsonify({
            'success': True,
            'message': f'Added {added_count} keyword(s)',
            'count': added_count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-csv', methods=['POST'])
def upload_csv():
    """Upload CSV file with keywords"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are allowed'}), 400
        
        # Read CSV file
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.reader(stream)
        
        keywords = []
        for row in csv_reader:
            if row:  # Skip empty rows
                # Take first column as keyword
                keyword = row[0].strip()
                if keyword and not keyword.startswith('#'):  # Skip empty and comment lines
                    keywords.append(keyword)
        
        if not keywords:
            return jsonify({'error': 'No valid keywords found in CSV'}), 400
        
        added_count = db.add_keywords_bulk(keywords)
        
        return jsonify({
            'success': True,
            'message': f'Uploaded {added_count} keyword(s) from CSV',
            'count': added_count
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/results', methods=['GET'])
def get_results():
    """Get discovered domains"""
    try:
        limit = request.args.get('limit', 100, type=int)
        domains = db.get_available_domains(limit)
        
        results = []
        for domain in domains:
            results.append({
                'id': domain['id'],
                'domain': domain['domain'],
                'keyword': domain['keyword'],
                'checked_date': domain['checked_date'],
                'notified': bool(domain['notified'])
            })
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-csv', methods=['GET'])
def download_csv():
    """Download results as CSV"""
    try:
        # Get ALL domains (both available and taken)
        domains = db.get_all_domains(limit=10000)
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(['Domain', 'Keyword', 'Status', 'Checked Date', 'Email Notified'])
        
        # Write data
        for domain in domains:
            # Parse the date string and format it properly for Excel
            try:
                # Parse the datetime string from database
                dt = datetime.strptime(domain['checked_date'], '%Y-%m-%d %H:%M:%S')
                # Format as Excel-friendly format (YYYY-MM-DD HH:MM:SS)
                formatted_date = dt.strftime('%Y-%m-%d %H:%M:%S')
            except:
                formatted_date = domain['checked_date']
            
            writer.writerow([
                domain['domain'],
                domain['keyword'],
                'Available' if domain['available'] else 'Taken',
                formatted_date,
                'Yes' if domain['notified'] else 'No'
            ])
        
        # Create response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'domain_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/keywords/list', methods=['GET'])
def list_keywords():
    """Get all keywords"""
    try:
        keywords = db.get_all_keywords()
        
        results = []
        for kw in keywords:
            results.append({
                'id': kw['id'],
                'keyword': kw['keyword'],
                'added_date': kw['added_date']
            })
        
        return jsonify({
            'success': True,
            'count': len(results),
            'keywords': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    try:
        keywords = db.get_all_keywords()
        all_domains = db.get_available_domains(limit=10000)
        
        return jsonify({
            'success': True,
            'status': {
                'keywords_count': len(keywords),
                'domains_found': len(all_domains),
                'email_configured': Config.is_email_configured()
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan-now', methods=['POST'])
def trigger_scan():
    """Trigger an immediate domain scan"""
    try:
        from monitor_service import MonitorService
        
        # Run scan in background to avoid blocking
        import threading
        
        def run_scan():
            service = MonitorService()
            service.run_scan()
        
        thread = threading.Thread(target=run_scan)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Domain scan started in background'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear-data', methods=['POST'])
def clear_data():
    """Clear all data (keywords, domains, history)"""
    try:
        db.clear_all_data()
        return jsonify({
            'success': True,
            'message': 'All data cleared successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# User preference endpoints (must come BEFORE generic /api/settings)
@app.route('/api/settings/<key>', methods=['GET'])
def get_user_setting(key):
    """Get a single setting value"""
    try:
        value = db.get_setting(key)
        return jsonify({
            'success': True,
            'key': key,
            'value': value
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings/save', methods=['POST'])
def save_user_setting():
    """Save a single setting value"""
    try:
        data = request.get_json()
        key = data.get('key')
        value = data.get('value')
        
        if not key:
            return jsonify({
                'success': False,
                'error': 'Missing key'
            }), 400
        
        db.save_setting(key, value)
        return jsonify({
            'success': True,
            'key': key,
            'value': value
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Email settings endpoints
@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get current email settings"""
    try:
        config = Config.get_email_config()
        # Don't expose password
        config['smtp_password'] = '********' if config['smtp_password'] else ''
        return jsonify({
            'success': True,
            'settings': config
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings', methods=['POST'])
def save_settings():
    """Save email settings"""
    try:
        data = request.get_json()
        settings = data.get('settings', {})
        
        # Save each setting
        for key, value in settings.items():
            if key == 'smtp_password' and value == '********':
                continue # Don't update password if it's the mask
                
            if key in ['smtp_server', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_from', 'smtp_to']:
                db.save_setting(key, value)
        
        return jsonify({
            'success': True,
            'message': 'Settings saved successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-email', methods=['POST'])
def test_email():
    """Send a test email with current settings"""
    try:
        # Load fresh config (which might have just been saved)
        config = Config.get_email_config()
        
        if not Config.is_email_configured():
            return jsonify({'error': 'Email not fully configured'}), 400
            
        import smtplib
        from email.mime.text import MIMEText
        
        msg = MIMEText('This is a test email from Domain Monitor System.\n\nIf you received this, your email settings are configured correctly!')
        msg['Subject'] = 'Domain Monitor - Test Email'
        msg['From'] = config['smtp_from']
        msg['To'] = config['smtp_to']
        
        with smtplib.SMTP(config['smtp_server'], config['smtp_port']) as server:
            server.starttls()
            server.login(config['smtp_username'], config['smtp_password'])
            server.send_message(msg)
            
        return jsonify({
            'success': True,
            'message': 'Test email sent successfully!'
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to send email: {str(e)}'}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("Domain Monitor API Starting...")
    print(f"Dashboard: http://localhost:{Config.API_PORT}")
    print("=" * 60)
    app.run(host='0.0.0.0', port=Config.API_PORT, debug=True)

