# 🌐 Custom Domain Setup - codewithmorais.com/dashboard.html

## ✅ What's Already Configured

Your Firebase hosting is now configured to serve your production dashboard at:
- `https://codewithmorais.com/dashboard.html`
- `https://codewithmorais.com/dashboard` 
- `https://codewithmorais.com/production-dashboard.html`

## 🔧 Firebase Hosting Configuration

### **Updated `firebase.json`:**
```json
{
  "source": "/dashboard",
  "destination": "/production-dashboard.html"
},
{
  "source": "/dashboard.html", 
  "destination": "/production-dashboard.html"
}
```

### **Updated `public/dashboard.html`:**
- Now redirects automatically to `production-dashboard.html`
- Includes fallback manual link if redirect fails
- Shows loading animation during redirect

## 🚀 Deployment Steps for Custom Domain

### **Step 1: Firebase Console Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `code-with-morais-405`
3. Navigate to **Hosting**
4. Click **"Add custom domain"**
5. Enter: `codewithmorais.com`
6. Follow Firebase's domain verification steps

### **Step 2: DNS Configuration** 
You'll need to add these DNS records to your domain provider:

#### **For Apex Domain (codewithmorais.com):**
```
Type: A
Name: @
Value: [Firebase will provide IP addresses]
```

#### **For Subdomain (www.codewithmorais.com):**
```
Type: CNAME
Name: www
Value: [Firebase will provide target]
```

### **Step 3: Upload Your Files**
Upload these files to Firebase Hosting:

**Required Files:**
- ✅ `dashboard.html` (redirect page - already updated)
- ✅ `production-dashboard.html` (your main dashboard)
- ✅ `firebase-lesson-integration.js` (lesson connector)
- ✅ All other files in `public/` folder

### **Step 4: Update Firestore Rules**
In Firebase Console → Firestore Database → Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /leaderboard/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🧪 Testing Your Setup

### **Local Testing First:**
```powershell
# Test the redirect locally
start http://localhost:5000/dashboard.html
start http://localhost:5000/dashboard
```

### **After Deployment:**
```
✅ https://codewithmorais.com/dashboard.html
✅ https://codewithmorais.com/dashboard
✅ https://codewithmorais.com/production-dashboard.html
```

## 🔐 Authentication Setup

### **Update Firebase Auth Domains:**
1. Firebase Console → Authentication → Settings
2. **Authorized domains** section
3. **Add these domains:**
   - `codewithmorais.com`
   - `www.codewithmorais.com`
   - `localhost` (for testing)

### **Google OAuth Configuration:**
Your Google OAuth client should already include:
- `https://codewithmorais.com`
- `https://www.codewithmorais.com`

If not, add them in [Google Cloud Console](https://console.cloud.google.com/).

## 📂 File Structure After Setup

```
public/
├── dashboard.html                    # 🆕 Redirect to production dashboard
├── production-dashboard.html         # 🎯 Your main real dashboard  
├── firebase-lesson-integration.js    # 🔗 Lesson completion system
├── firebase-config.js               # ⚙️ Firebase configuration
└── ... (all your other files)
```

## 🚀 Quick Deploy Commands

### **Option A: Firebase Console (Manual)**
1. Upload `public/` folder contents to Firebase Hosting
2. Update Firestore rules in Database section

### **Option B: Firebase CLI (Automated)**
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## ✅ Success Checklist

After deployment, verify:

### **🌐 URL Access:**
- [ ] `https://codewithmorais.com/dashboard.html` loads
- [ ] Redirects to production dashboard automatically
- [ ] Shows real Firebase authentication screen

### **🔐 Authentication:**
- [ ] Google Sign-In button appears
- [ ] Can sign in with Google account
- [ ] User profile information loads correctly

### **📊 Dashboard Functionality:**
- [ ] User statistics display (lessons, coins, points)
- [ ] Progress bars show correct percentages  
- [ ] Achievement system shows locked/unlocked states
- [ ] Recent activity feeds show user actions
- [ ] Learning path reflects completion status

### **📱 Responsive Design:**
- [ ] Works on desktop browsers
- [ ] Mobile-friendly layout
- [ ] Tablet compatibility
- [ ] Touch interactions work properly

### **🔄 Real-time Features:**
- [ ] Data persists across page refreshes
- [ ] Updates appear immediately when lessons completed
- [ ] Multiple device sync works correctly

## 🎯 Final URLs

Once deployed, your dashboard will be accessible at:

### **Primary Access Points:**
- `https://codewithmorais.com/dashboard.html` ← **Your requested URL**
- `https://codewithmorais.com/dashboard`
- `https://codewithmorais.com/production-dashboard.html`

### **Alternative Firebase URLs:**
- `https://code-with-morais-405.web.app/dashboard.html`
- `https://code-with-morais-405.firebaseapp.com/dashboard.html`

## 🛠️ Troubleshooting

### **Common Issues:**

1. **"Dashboard not loading"**
   - Check DNS propagation (can take up to 48 hours)
   - Verify Firebase custom domain setup
   - Test using Firebase default URLs first

2. **"Authentication not working"**
   - Add custom domain to Firebase Auth authorized domains
   - Update Google OAuth client authorized origins
   - Check browser console for auth errors

3. **"Data not saving"**
   - Verify Firestore rules are deployed
   - Check user has proper authentication
   - Monitor Firebase console for rule violations

### **Debug Steps:**
```javascript
// Add to browser console for debugging
console.log('Current URL:', window.location.href);
console.log('Firebase config:', firebase.apps[0].options);
console.log('Auth state:', firebase.auth().currentUser);
```

## 🎉 Success!

Your production dashboard will be live at:
**`https://codewithmorais.com/dashboard.html`**

With real Firebase authentication, persistent data storage, achievement tracking, and real-time synchronization across all devices!

---

**Ready to deploy and go live on your custom domain!** 🚀