
#!/bin/bash

echo "🚀 Setting up GitHub repository for Správa Zakázek..."

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "🎉 Initial commit: Full-stack Správa Zakázek application

Features:
- React 19 frontend with modern design
- FastAPI backend with Firebase integration
- Multi-profile authentication
- Advanced dashboard with charts
- Calendar integration
- PDF export functionality
- Map integration
- Supabase database integration
- Responsive design

Tech stack:
- Frontend: React, Chart.js, Leaflet, Moment.js
- Backend: FastAPI, Firebase Admin SDK
- Database: Supabase, Firebase Firestore
- Styling: Custom CSS with modern design"

echo "✅ Git repository initialized!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add remote: git remote add origin https://github.com/yourusername/your-repo-name.git"
echo "3. Push to GitHub: git push -u origin main"
echo "4. Set up environment variables as described in .env.template files"
echo "5. Deploy using your preferred platform (see DEPLOYMENT.md)"
echo ""
echo "🎯 Your application is ready for GitHub!"
