#!/bin/bash

echo "🚀 Starting Atonix Capital Application..."
echo ""

API_DIR="api"
VENV_DIR=".venv"
if [ -d "$API_DIR/venv" ] && [ ! -d "$API_DIR/.venv" ]; then
	VENV_DIR="venv"
fi

# Start API
echo "📦 Starting Django API..."
cd "$API_DIR"
if [ -f ".env" ]; then
	set -a
	source .env
	set +a
fi
VENV_PYTHON="$PWD/$VENV_DIR/bin/python"
if [ ! -x "$VENV_PYTHON" ]; then
	python3 -m venv "$VENV_DIR"
	VENV_PYTHON="$PWD/$VENV_DIR/bin/python"
fi
"$VENV_PYTHON" -m pip install -r requirements.txt > /dev/null 2>&1
"$VENV_PYTHON" manage.py migrate > /dev/null 2>&1
"$VENV_PYTHON" manage.py runserver &
API_PID=$!
echo "✅ API running on http://localhost:8000"

if [ "${ENABLE_BANKING_SYNC_SCHEDULER:-1}" = "1" ]; then
	(
		while true; do
			"$VENV_PYTHON" manage.py sync_banking_integrations > /dev/null 2>&1
			sleep "${BANKING_SYNC_INTERVAL_SECONDS:-86400}"
		done
	) &
	BANKING_SYNC_PID=$!
	echo "✅ Nightly banking sync scheduler enabled"
fi

if [ "${ENABLE_APPROVAL_DIGEST_SCHEDULER:-1}" = "1" ]; then
	(
		while true; do
			"$VENV_PYTHON" manage.py send_approval_notification_digest --hours "${APPROVAL_DIGEST_LOOKBACK_HOURS:-24}" > /dev/null 2>&1
			sleep "${APPROVAL_DIGEST_INTERVAL_SECONDS:-86400}"
		done
	) &
	APPROVAL_DIGEST_PID=$!
	echo "✅ Daily approval digest scheduler enabled"
fi
cd ..

# Wait a moment
sleep 2

# Start app
echo "⚛️  Starting React app..."
cd app
npm install > /dev/null 2>&1
npm start &
APP_PID=$!
echo "✅ App running on http://localhost:3000"
cd ..

echo ""
echo "🎉 Application is ready!"
echo "📊 App: http://localhost:3000"
echo "🔌 API: http://localhost:8000/api"
echo "🛠️  Admin Panel: http://localhost:8000/admin"
echo "🏦 Banking webhook base: http://localhost:8000/api/banking-integrations/webhooks/<provider_code>/"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "kill $API_PID $APP_PID ${BANKING_SYNC_PID:-} ${APPROVAL_DIGEST_PID:-} 2>/dev/null; exit" INT
wait
