#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Implementace Firebase integrace pro cloud sync a přípravu na deployment - export odkaz pro veřejný přístup"

frontend:
  - task: "Dynamické kategorie práce"
    implemented: true
    working: true
    file: "/app/frontend/src/App.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "Funkcionalita dynamických kategorií práce byla úspěšně otestována. Aplikace správně zobrazuje výchozí kategorie (Adam, MVČ, Korálek, Ostatní) a umožňuje přidávání nových kategorií. Kategorie jsou správně ukládány do localStorage a zobrazují se ve filtrech."

  - task: "Změna názvu aplikace a přesun uživatele"
    implemented: true
    working: false
    file: "/app/frontend/src/App.js, /app/frontend/src/App.css"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: false
        -agent: "main"
        -comment: "Změnil jsem název aplikace z 'PaintPro/Project Manager' na 'Dušan/Správa zakázek' v logo-title a logo-subtitle. Přesunul jsem uživatelské informace z pozice pod názvem aplikace do spodního levého rohu sidebaru pomocí nové třídy user-info-bottom a flexbox layoutu. Sidebar nyní používá display: flex s flex-direction: column a uživatelské info má margin-top: auto."

  - task: "Vycentrování čísel v dashboard kartách"
    implemented: true
    working: false
    file: "/app/frontend/src/App.css"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
        -working: false
        -agent: "main"
        -comment: "Upravil jsem CSS styling pro stat-value-row na align-items: center místo flex-start, odstranil margin-top z .stat-icon a přidal justify-content: center do .stat-value-with-subtitle pro správné vycentrování čísel vůči kruhové ikoně v dashboard kartách."

  - task: "Kompletní PDF export všech stránek"
    implemented: true
    working: false
    file: "/app/frontend/src/App.js"
    stuck_count: 1
    priority: "high"
    needs_retesting: true
    status_history:
        -working: false
        -agent: "main"
        -comment: "Původní PDF export funkcionalita pouze zachytávala Dashboard a Mapu, chyběly Zakázky a Reporty. Implementoval jsem vylepšenou verzi s: 1) Specifickými selektory pro každou stránku (.dashboard, .zakazky, .reporty, .mapa-zakazek), 2) Delší čekací doby pro renderování (5s + 2s extra pro reporty/mapu), 3) Lepší screenshot nastavení, 4) Zachování horizontálního formátu. Funkce byla upravena pro spolehlivější zachytávání všech stránek."

backend:
  - task: "Backend API Endpoints"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "Všechny backend API endpointy byly úspěšně otestovány. Root endpoint (/api/) vrací očekávanou odpověď. POST /api/status úspěšně vytváří nové záznamy v MongoDB. GET /api/status úspěšně načítá záznamy z MongoDB. Vytvořil jsem backend_test.py skript pro automatické testování API."
  
  - task: "MongoDB Connectivity"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "MongoDB připojení funguje správně. Backend úspěšně zapisuje a čte data z MongoDB databáze. Testy potvrdily, že data jsou správně ukládána a načítána."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 2
  run_ui: false

test_plan:
  current_focus:
    - "Změna názvu aplikace a přesun uživatele"
    - "Vycentrování čísel v dashboard kartách"
    - "Kompletní PDF export všech stránek"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Dokončil jsem tři úpravy: 1) Změnil název aplikace na 'Dušan/Správa zakázek', 2) Přesunul uživatelské informace do spodního levého rohu sidebaru pomocí flexbox layoutu, 3) Vycentroval čísla v dashboard kartách, 4) Vylepšil PDF export pro všechny 4 stránky v horizontálním formátu. Všechny změny jsou připravené k testování."
    -agent: "testing"
    -message: "Provedl jsem kompletní test backend API. Všechny testy prošly úspěšně. Backend server běží správně, API endpointy fungují a MongoDB připojení je funkční. Vytvořil jsem backend_test.py skript, který testuje všechny dostupné API endpointy (/api/, /api/status POST, /api/status GET). Všechny testy prošly bez problémů."