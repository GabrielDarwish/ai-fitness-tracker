# 📚 Exercise Library Setup Guide

## Overview
The Exercise Library allows users to browse 1300+ exercises from ExerciseDB, filter them by body part, equipment, and target muscle, and save their favorites.

**✨ NEW: Auto-Sync Feature** - Exercises are **automatically cached** when a user first visits the library. No manual setup required!

---

## 🔑 Prerequisites

1. **ExerciseDB API Key** ⚠️ **REQUIRED**
   - Sign up at [RapidAPI ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
   - Get your API key
   - Add it to your `.env` file:
     ```env
     EXERCISEDB_API_KEY=your_api_key_here
     ```
   - **That's it!** The rest is automatic.

---

## 🚀 How It Works

### Automatic Sync on First Visit

When any user visits `/library` for the first time:

1. **Auto-check**: The app checks if exercises exist in the database
2. **Auto-sync**: If empty, it automatically fetches all 1300+ exercises from ExerciseDB
3. **Progress UI**: User sees a nice loading screen with progress indicator
4. **One-time only**: Exercises are cached forever, no re-sync needed
5. **Zero manual work**: Everything happens automatically!

### First Visit Experience

User sees:
```
💪 (animated)
Loading Exercise Library...
First time setup - caching 1300+ exercises from ExerciseDB
[Progress bar]
This may take 30-60 seconds...
```

### Subsequent Visits

After the first sync:
- Instant load - exercises are cached in your database
- No API calls to ExerciseDB (rate-limit friendly!)
- Normal browsing experience

---

## ⚠️ Error Handling

If the ExerciseDB API key is missing, users will see:

```
⚠️
Setup Required
ExerciseDB API key not configured. Please add EXERCISEDB_API_KEY to your .env file.

[Instructions to fix]
[Retry button]
```

---

## 🛠️ Manual Sync (Optional)

If you want to manually trigger a sync (e.g., to update exercise data):

If you need to re-sync all exercises (e.g., ExerciseDB updated their data):

1. Delete all exercises from the database:
   ```bash
   npx prisma studio
   # Open Exercise table and delete all records
   ```

2. Visit `/library` again - auto-sync will trigger

**Option B: Using the Manual Sync Endpoint**

For admin use only (force sync even if exercises exist):

```bash
curl -X POST http://localhost:3000/api/exercises/sync
```

This will upsert all exercises (update existing, create new ones).

---

## 📖 Usage

### For Users:

1. **Access the Library**
   - From the dashboard, click the "Exercise Library" card
   - Or navigate to `/library`

2. **Browse Exercises**
   - View all exercises in a responsive grid
   - Each card shows:
     - Exercise GIF animation
     - Exercise name
     - Body part, equipment, and target muscle tags
     - Save/unsave heart button

3. **Filter Exercises**
   - Use the search bar to find exercises by name
   - Filter by body part (e.g., chest, back, legs)
   - Filter by equipment (e.g., dumbbell, barbell, body weight)
   - Filter by target muscle (e.g., biceps, glutes, abs)
   - Combine multiple filters for precise results

4. **Save Favorites**
   - Click the heart icon on any exercise to save it
   - Switch to "My Saved" tab to view saved exercises
   - Click the filled heart to unsave

5. **Load More**
   - Exercises load 30 at a time
   - Click "Load More" to see additional results

---

## 🎨 Features

✅ **1300+ Exercises** from ExerciseDB  
✅ **Real-time search** by exercise name  
✅ **Advanced filtering** by body part, equipment, target muscle  
✅ **Save/unsave** exercises to your personal collection  
✅ **Responsive design** works on mobile, tablet, and desktop  
✅ **Optimistic UI** with loading states  
✅ **Pagination** for smooth browsing  

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/exercises` | GET | Fetch exercises with filters |
| `/api/exercises/sync` | POST | Sync exercises from ExerciseDB |
| `/api/saved-exercises` | GET | Get user's saved exercises |
| `/api/saved-exercises` | POST | Save an exercise |
| `/api/saved-exercises` | DELETE | Unsave an exercise |

### Query Parameters for `/api/exercises`:

- `bodyPart` - Filter by body part
- `equipment` - Filter by equipment type
- `target` - Filter by target muscle
- `search` - Search by exercise name
- `limit` - Number of results per page (default: 30)
- `offset` - Pagination offset (default: 0)

---

## 🛠️ Troubleshooting

### "No exercises found"
- Make sure you've run the sync endpoint or seed script
- Check that `EXERCISEDB_API_KEY` is set in `.env`
- Verify exercises exist in the database:
  ```bash
  npx prisma studio
  # Check the Exercise table
  ```

### "Failed to fetch exercises"
- Check browser console for errors
- Ensure you're authenticated
- Verify database connection

### ExerciseDB API rate limits
- Free tier: 100 requests/month
- Exercises are cached locally, so you only need to sync once
- Re-sync only when you want to update exercise data

---

## 🚀 Next Steps

The Exercise Library is the foundation for:
- **Custom Workout Builder** - Add saved exercises to workout templates
- **AI Workout Generator** - AI can reference the exercise library
- **Workout Logging** - Log sets/reps for exercises
- **Progress Tracking** - Track PRs for specific exercises

---

## 💡 Tips

1. **Sync once during deployment** - Don't sync on every build
2. **Use saved exercises** - Users can quickly find their favorites
3. **Filters are powerful** - Combine search + filters for best results
4. **Mobile-friendly** - Grid layout adapts to all screen sizes

