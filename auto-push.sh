
#!/bin/bash

echo "🚀 Automaticky pushuju změny do PaintPro GitHub repository..."

# Zkontrolujeme remote URL
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
EXPECTED_REMOTE="https://github.com/marelhott/paintpro.git"

if [ "$CURRENT_REMOTE" != "$EXPECTED_REMOTE" ]; then
    echo "🔧 Nastavuji správný remote pro paintpro..."
    git remote set-url origin $EXPECTED_REMOTE 2>/dev/null || git remote add origin $EXPECTED_REMOTE
fi

# Zkontrolujeme jestli jsou nějaké změny
if [ -n "$(git status --porcelain)" ]; then
    echo "✅ Nalezeny změny, commituju..."
    
    # Přidáme všechny změny
    git add .
    
    # Commitneme s timestampem
    git commit -m "PaintPro Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Pushneme do paintpro GitHub repository
    git push origin main
    
    echo "✅ Změny úspěšně pushnuty do paintpro repository!"
else
    echo "ℹ️  Žádné změny k pushnutí"
fi
