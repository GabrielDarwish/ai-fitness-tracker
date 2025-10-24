# AI Fitness Tracker - Git Setup Script
# Run this in a NEW PowerShell window (not where dev server is running)

Write-Host "`n🔧 Setting up Git for AI Fitness Tracker...`n" -ForegroundColor Cyan

# Get parent directory
$parentDir = Split-Path -Parent (Get-Location)

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Run this script from the ai-fitness-tracker folder" -ForegroundColor Red
    exit 1
}

Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Remove git from parent directory if it exists
Write-Host "`n1️⃣ Checking parent directory for .git..." -ForegroundColor Cyan
if (Test-Path "$parentDir\.git") {
    Write-Host "   Found .git in parent folder. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$parentDir\.git"
    Write-Host "   ✓ Removed .git from parent folder" -ForegroundColor Green
} else {
    Write-Host "   ✓ No .git found in parent folder" -ForegroundColor Green
}

# Remove .cursor from parent directory (optional, not needed in git)
if (Test-Path "$parentDir\.cursor") {
    Write-Host "   Removing .cursor from parent folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$parentDir\.cursor"
    Write-Host "   ✓ Removed .cursor from parent folder" -ForegroundColor Green
}

# Initialize git in project folder
Write-Host "`n2️⃣ Initializing Git in project folder..." -ForegroundColor Cyan
if (Test-Path ".git") {
    Write-Host "   ⚠️  Git already initialized here" -ForegroundColor Yellow
    $response = Read-Host "   Do you want to reinitialize? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item -Recurse -Force .git
        git init
        Write-Host "   ✓ Reinitialized git repository" -ForegroundColor Green
    }
} else {
    git init
    Write-Host "   ✓ Initialized new git repository" -ForegroundColor Green
}

# Configure git user if needed
Write-Host "`n3️⃣ Checking git configuration..." -ForegroundColor Cyan
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName) {
    $inputName = Read-Host "   Enter your name for git commits"
    git config user.name "$inputName"
    Write-Host "   ✓ Set git user.name" -ForegroundColor Green
}

if (-not $userEmail) {
    $inputEmail = Read-Host "   Enter your email for git commits"
    git config user.email "$inputEmail"
    Write-Host "   ✓ Set git user.email" -ForegroundColor Green
}

Write-Host "   Git user: $(git config user.name) <$(git config user.email)>" -ForegroundColor Yellow

# Add all files
Write-Host "`n4️⃣ Adding files to git..." -ForegroundColor Cyan
git add .
Write-Host "   ✓ Added all files" -ForegroundColor Green

# Show what will be committed
Write-Host "`n📋 Files to be committed:" -ForegroundColor Cyan
git status --short

# Create initial commit
Write-Host "`n5️⃣ Creating initial commit..." -ForegroundColor Cyan
git commit -m "Initial commit: AI Fitness Tracker

- Next.js 14 with TypeScript and App Router
- Prisma ORM with Supabase PostgreSQL
- NextAuth.js with Google OAuth
- Tailwind CSS with custom design system
- React Query for data fetching
- Complete database schema for fitness tracking
- Authentication pages and protected routes"

Write-Host "   ✓ Created initial commit" -ForegroundColor Green

# Show final status
Write-Host "`n✅ Git Setup Complete!`n" -ForegroundColor Green
Write-Host "📊 Repository Status:" -ForegroundColor Cyan
git log --oneline -1
git status

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   • Create a GitHub repository" -ForegroundColor White
Write-Host "   • git remote add origin <your-repo-url>" -ForegroundColor White
Write-Host "   • git branch -M main" -ForegroundColor White
Write-Host "   • git push -u origin main" -ForegroundColor White
Write-Host ""

