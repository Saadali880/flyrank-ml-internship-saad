import json
import re
import sys
import unittest
from io import StringIO

DEFAULT_PATTERN = r'^\[(?P<timestamp>.*?)\]\s+(?P<level>WARN|WARNING|ERR|ERROR)\s+(?P<message>.*)$'

def parse_logs_stream(infile, outfile, log_regex=DEFAULT_PATTERN):
    """
    Parses logs from infile (file-like object) and writes a structured JSON report
    to outfile (file-like object) in an iterative, memory-safe manner.
    """
    try:
        compiled_pat = re.compile(log_regex)
    except re.error as e:
        sys.stderr.write(f"Error: Invalid regular expression pattern: {e}\n")
        raise e
        
    summary = {'WARN': 0, 'ERROR': 0}
    outfile.write('{\n  "details": [\n')
    
    first_item = True
    line_count = 0
    
    for line in infile:
        line_count += 1
        stripped = line.strip()
        if not stripped:
            continue
        
        match = compiled_pat.match(stripped)
        if not match:
            sys.stderr.write(f"Warning: Line {line_count} skipped (no pattern match)\n")
            continue
        
        gd = match.groupdict()
        if 'timestamp' not in gd or 'level' not in gd or 'message' not in gd:
            sys.stderr.write(f"Warning: Line {line_count} skipped (missing named capture groups 'timestamp', 'level', or 'message')\n")
            continue
            
        level = gd['level'].upper()
        normalized_level = 'WARN' if 'WARN' in level else 'ERROR'
        summary[normalized_level] += 1
        
        detail_item = {
            'timestamp': gd['timestamp'],
            'level': normalized_level,
            'message': gd['message']
        }
        
        if not first_item:
            outfile.write(',\n')
        else:
            first_item = False
        
        outfile.write('    ' + json.dumps(detail_item))
        
    outfile.write('\n  ],\n  "summary": ' + json.dumps(summary) + '\n}\n')
    return summary

def parse_logs_files(file_path, output_json_path, log_regex=DEFAULT_PATTERN):
    """
    Opens file paths and forwards them to parse_logs_stream.
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as infile, \
             open(output_json_path, 'w', encoding='utf-8') as outfile:
            return parse_logs_stream(infile, outfile, log_regex)
    except FileNotFoundError:
        sys.stderr.write(f"Error: Log file '{file_path}' not found.\n")
        sys.exit(1)
    except PermissionError:
        sys.stderr.write(f"Error: Permission denied writing to '{output_json_path}'.\n")
        sys.exit(1)

class TestLogParser(unittest.TestCase):
    def test_standard_parsing(self):
        input_data = StringIO(
            "[2026-07-15 12:00:01] ERROR Database connection failed\n"
            "[2026-07-15 12:00:02] INFO System heartbeat\n"
            "[2026-07-15 12:00:03] WARN Disk space low\n"
        )
        output_data = StringIO()
        summary = parse_logs_stream(input_data, output_data)
        
        self.assertEqual(summary['ERROR'], 1)
        self.assertEqual(summary['WARN'], 1)
        
        output_json = json.loads(output_data.getvalue())
        self.assertEqual(output_json['summary']['ERROR'], 1)
        self.assertEqual(output_json['summary']['WARN'], 1)
        self.assertEqual(len(output_json['details']), 2)
        self.assertEqual(output_json['details'][0]['level'], 'ERROR')
        self.assertEqual(output_json['details'][0]['message'], 'Database connection failed')
        self.assertEqual(output_json['details'][1]['level'], 'WARN')
        self.assertEqual(output_json['details'][1]['message'], 'Disk space low')

    def test_malformed_lines_skipped(self):
        input_data = StringIO(
            "[2026-07-15 12:00:01] ERROR Database connection failed\n"
            "Invalid log line here\n"
            "[2026-07-15 12:00:03] WARN Disk space low\n"
        )
        output_data = StringIO()
        # Capture stderr to avoid printing expected warnings during test runs
        old_stderr = sys.stderr
        sys.stderr = StringIO()
        try:
            summary = parse_logs_stream(input_data, output_data)
        finally:
            stderr_val = sys.stderr.getvalue()
            sys.stderr = old_stderr
            
        self.assertEqual(summary['ERROR'], 1)
        self.assertEqual(summary['WARN'], 1)
        self.assertIn("Warning: Line 2 skipped (no pattern match)", stderr_val)

    def test_custom_regex(self):
        # Format: timestamp | level | message (no brackets)
        custom_pattern = r'^(?P<timestamp>.*?)\s*\|\s*(?P<level>WARN|ERROR)\s*\|\s*(?P<message>.*)$'
        input_data = StringIO(
            "2026-07-15 12:00:01 | ERROR | Database connection failed\n"
            "2026-07-15 12:00:03 | WARN | Disk space low\n"
        )
        output_data = StringIO()
        summary = parse_logs_stream(input_data, output_data, log_regex=custom_pattern)
        
        self.assertEqual(summary['ERROR'], 1)
        self.assertEqual(summary['WARN'], 1)
        output_json = json.loads(output_data.getvalue())
        self.assertEqual(output_json['details'][0]['timestamp'], '2026-07-15 12:00:01')

if __name__ == '__main__':
    # If run directly as a script, check arguments or run tests
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        # Strip the 'test' argument so unittest doesn't try to parse it
        sys.argv = sys.argv[:1]
        unittest.main()
    elif len(sys.argv) >= 3:
        pattern = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_PATTERN
        parse_logs_files(sys.argv[1], sys.argv[2], pattern)
    else:
        print("Usage to parse: python log_parser.py <input_log> <output_json> [regex_pattern]")
        print("Usage to test:  python log_parser.py test")
