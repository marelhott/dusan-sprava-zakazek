
#!/bin/bash

echo "🚀 Automaticky pushuju změny do PaintPro GitHub repository..."

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
