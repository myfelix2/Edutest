// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc1iA6Wl67FCbfKI9ZWN0GP0-6ZBvkpJ8",
  authDomain: "edutest-insight.firebaseapp.com",
  projectId: "edutest-insight",
  storageBucket: "edutest-insight.appspot.com",
  messagingSenderId: "802346421840",
  appId: "1:802346421840:web:2fe4d970be8dbd5ff54b55",
  measurementId: "G-M06P894FJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to sign in user or create user document
async function signInOrCreateUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        subscription: 'free',
        expiryDate: '',
        remind: '',
        resume: '',
      });
    } else {
      console.error("Error signing in:", error);
    }
  }
}

// Function to check payment status
async function checkPaymentStatus(email) {
  const userDocRef = doc(db, "users", email);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    const now = new Date();
    const expiryDate = new Date(userData.expiryDate);

    if (userData.subscription !== 'free' && now > expiryDate) {
      alert("Your subscription has expired. Please renew to continue.");
      showPaymentForm(email);
    } else if (userData.subscription === 'free') {
      showPaymentForm(email);
    }
  } else {
    showPaymentForm(email);
  }
}

// Function to show payment form
function showPaymentForm(email) {
  document.getElementById("email").value = email;
  document.getElementById("payment-form").submit();
}

// Function to show email prompt
function showEmailPrompt() {
  const emailPrompt = document.createElement('div');
  emailPrompt.id = 'email-prompt';
  emailPrompt.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    color: white;
    text-align: center;
  `;
  emailPrompt.innerHTML = `
    <div style="
      background: white;
      color: black;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    ">
      <h2>Welcome to EduTest Insight</h2>
      <p>To enhance your learning experience, please provide your email. Your email will not be shared with third parties.</p>
      <input type="email" id="user-email" placeholder="Enter your email" style="
        padding: 10px;
        width: 80%;
        margin-bottom: 10px;
      "/>
      <input type="password" id="user-password" placeholder="Enter any password" style="
        padding: 10px;
        width: 80%;
        margin-bottom: 20px;
      "/>
      <button onclick="submitEmail()" style="
        padding: 10px 20px;
        background: #1565c0;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      ">Submit</button>
    </div>
  `;
  document.body.appendChild(emailPrompt);
}

// Function to submit email
window.submitEmail = async function() {
  const email = document.getElementById("user-email").value;
  const password = document.getElementById("user-password").value;
  if (email && password) {
    await signInOrCreateUser(email, password);
    document.getElementById("email-prompt").style.display = 'none';
    await checkPaymentStatus(email);
  } else {
    alert("Please enter both email and password.");
  }
}

// Function to monitor user's stay on the website
function startEmailPromptTimer() {
  setTimeout(showEmailPrompt, 2 * 60 * 1000); // 2 minutes
}

// Event listener for page load
window.addEventListener('load', startEmailPromptTimer);

// Event listeners for user activity and lesson tracking
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email;
    await checkPaymentStatus(email);
  } else {
    // Prompt user to sign in
    showEmailPrompt();
  }
});
