// User profile creation and update logic for Firebase
// This file is deprecated. User creation and updates are now handled by the backend (Flask /auth endpoint).
// All logic here is disabled to prevent conflicts and duplicate user documents.

// firebase.auth().onAuthStateChanged(function(user) {
//   if (user) {
//     const userRef = firebase.firestore().collection('users').doc(user.uid);
//     userRef.get().then((doc) => {
//       if (!doc.exists) {
//         userRef.set({
//           created_at: firebase.firestore.FieldValue.serverTimestamp(),
//           email: user.email || "",
//           is_admin: false,
//           last_login: firebase.firestore.FieldValue.serverTimestamp(),
//           last_login_online_time: "",
//           name: user.displayName || "",
//           picture: user.photoURL || "",
//           total_points: 0,
//           // Set user_name to first name only
//           user_name: (user.displayName || "").split(" ")[0] || "",
//           user_title: "Newbie",
//           currency: 10
//         });
//       } else {
//         // Always update user_name in Firestore to first name from displayName
//         const firstName = (user.displayName || "").split(" ")[0] || "";
//         userRef.update({ user_name: firstName });
//       }
//     });
//   }
// });
