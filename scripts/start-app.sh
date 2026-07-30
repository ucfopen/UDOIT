# Load in the variables we need from the root directory. 
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.nginx.yml"
ENV_FILE="$ROOT_DIR/.env"

# Ensure the ENV_FILE exists.
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

# Ask if the user wants to enable telemetry if TELEMETRY_ENABLED is not set. If it's set to false or true, we will not ask again.
# Loop till we have a valid answer. If the user chooses to enable telemetry, we will write it to the .env file so that we don't ask again.
if [ -z "${TELEMETRY_ENABLED:-}" ]; then
    while true; do
        read -p "Would you like to send minimal metrics so we can know who is using the tool and open the door for support? This will only collect general location, LMS name (if set in the container), and app version. Do you want to enable it? (y/n): " choice

        case "$choice" in
             y|Y )
                TELEMETRY_ENABLED=true
                echo "TELEMETRY_ENABLED=true" >> "$ENV_FILE"
                break
                ;;
            n|N )
                TELEMETRY_ENABLED=false
                echo "TELEMETRY_ENABLED=false" >> "$ENV_FILE"
                break
                ;;
            * )
                echo "Invalid choice. Please enter 'y' or 'n'."
                ;;

        esac
    done 
fi

# Start the docker compose with the telemetry profile if TELEMETRY_ENABLED is true, otherwise start without the telemetry profile.
if [ "$TELEMETRY_ENABLED" = "true" ]; then
    docker compose --profile telemetry \
    --project-directory "$ROOT_DIR" \
    --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" up
else
    docker compose \
    --project-directory "$ROOT_DIR" \
    --env-file "$ENV_FILE" \
    -f "$COMPOSE_FILE" up
fi