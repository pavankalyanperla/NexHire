#!/bin/bash
# Starts all NexHire backend services and OcelotGateway in parallel.
# Run with: bash start-backend.sh
# Press Ctrl+C to stop all services.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PIDS=()

cleanup() {
  echo -e "\n${YELLOW}Stopping all services...${NC}"
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null
  done
  wait 2>/dev/null
  echo -e "${GREEN}All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

start_service() {
  local name="$1"
  local path="$2"
  local port="$3"

  echo -e "${GREEN}Starting ${name} on port ${port}...${NC}"
  (
    cd "$SCRIPT_DIR/$path" || exit 1
    dotnet run 2>&1 | sed "s/^/[${name}] /"
  ) &
  PIDS+=($!)
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  NexHire Backend Services Starting...  ${NC}"
echo -e "${GREEN}========================================${NC}"

start_service "IdentityService"    "backend/IdentityService/IdentityService.API"       5100
start_service "HRMSService"        "backend/HRMSService/HRMSService.API"               5200
start_service "RecruitmentService" "backend/RecruitmentService/RecruitmentService.API" 5300
start_service "OcelotGateway"      "gateway/OcelotGateway"                             5000

echo ""
echo -e "${YELLOW}All services launched. Listening on:${NC}"
echo -e "  IdentityService    → http://localhost:5100"
echo -e "  HRMSService        → http://localhost:5200"
echo -e "  RecruitmentService → http://localhost:5300"
echo -e "  OcelotGateway      → http://localhost:5000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

wait
